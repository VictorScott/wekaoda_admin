import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, GhostSpinner } from "components/ui";
import { useOnboardingFormContext } from "../OnboardingFormContext";
import { DocumentUpload } from "../components/DocumentUpload";
import { DatePicker } from "components/shared/form/Datepicker";
import API from "utils/api";
import { PreviewModal } from "../components/PreviewModal";
import { FILE_URL } from "configs/auth.config.js";

export function KYCDocuments({ setCurrentStep, refetchFormData }) {
    const { state, dispatch } = useOnboardingFormContext();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [documentList, setDocumentList] = useState([]);
    const [openPreviewIndex, setOpenPreviewIndex] = useState(null);

    const businessId = state.businessId;
    const uploadedDocs = state.formData?.kycDocuments?.docs || [];

    // Initial load and navigation back handling
    useEffect(() => {
        async function fetchAndMergeDocs() {
            if (!businessId) return;
            
            try {
                // Always refetch form data to ensure we have the latest uploaded documents
                if (typeof refetchFormData === "function") {
                    await refetchFormData();
                }

                const res = await API.post("/onboarding/kyc-doc-types", { business_id: businessId });
                if (res.data.success) {
                    const types = res.data.data;

                    const merged = types.map((type) => {
                        const existing = uploadedDocs.find((doc) => doc.doc_id === type.id);
                        return {
                            id: existing?.id || null,
                            doc_id: type.id,
                            doc_name: type.doc_name,
                            requirement_level: type.requirement_level,
                            expires_type: type.expires_type,
                            approval_status: existing?.approval_status || null,
                            uploaded_url: existing?.url || null,
                            expires_on: existing?.expires_on || null,
                            file: null,
                        };
                    });

                    setDocumentList(merged);
                } else {
                    setErrorMsg("Failed to fetch KYC document types");
                }
            } catch (err) {
                setErrorMsg(err?.response?.data?.message || "Fetch error");
            }
        }

        fetchAndMergeDocs();
    }, [businessId]); // Only depend on businessId to avoid infinite loops

    // Separate effect to handle uploaded docs changes
    useEffect(() => {
        if (documentList.length > 0 && uploadedDocs.length > 0) {
            const updatedList = documentList.map((doc) => {
                const existing = uploadedDocs.find((uploaded) => uploaded.doc_id === doc.doc_id);
                if (existing) {
                    return {
                        ...doc,
                        id: existing.id,
                        approval_status: existing.approval_status,
                        uploaded_url: existing.url,
                        expires_on: existing.expires_on,
                    };
                }
                return doc;
            });
            setDocumentList(updatedList);
        }
    }, [uploadedDocs]);

    // Watch for business type changes and reload documents
    const businessType = state?.formData?.businessDetails?.businessType || state?.formData?.meta?.business_type;
    useEffect(() => {
        if (businessType) {
            // Clear current documents and refetch for new business type
            setDocumentList([]);
            async function refetchDocs() {
                try {
                    const res = await API.post("/onboarding/kyc-doc-types", { business_id: businessId });
                    if (res.data.success) {
                        const types = res.data.data;
                        const merged = types.map((type) => ({
                            id: null,
                            doc_id: type.id,
                            doc_name: type.doc_name,
                            requirement_level: type.requirement_level,
                            expires_type: type.expires_type,
                            approval_status: null,
                            uploaded_url: null,
                            expires_on: null,
                            file: null,
                        }));
                        setDocumentList(merged);
                    }
                } catch (err) {
                    setErrorMsg(err?.response?.data?.message || "Failed to load documents for new business type");
                }
            }
            refetchDocs();
        }
    }, [businessType, businessId]);

    const schema = yup.object().shape({
        docs: yup.array().of(
            yup.object().shape({
                file: yup.mixed().nullable().test(
                    "required-if-mandatory",
                    "This file is required",
                    function (value) {
                        const { parent } = this;
                        const isMandatory = parent.requirement_level === "mandatory";
                        const exists = !!parent.uploaded_url;
                        const isPending = parent.approval_status === "pending";
                        return !isMandatory || value || exists || isPending;
                    }
                ),
                expires_on: yup.date().nullable(),
            })
        ),
    });

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { docs: [] },
        resolver: yupResolver(schema),
    });

    const { fields, replace } = useFieldArray({ name: "docs", control });

    useEffect(() => {
        if (documentList.length > 0) {
            reset({ docs: documentList });
            replace(documentList);
        }
    }, [documentList, reset, replace]);

    const getFileType = (url) => {
        if (!url) return "image";
        return url.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image";
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMsg("");

        const hasNewUpload = data.docs.some((d) => d.file !== null);
        const allRequiredSatisfied = documentList.every((doc, idx) => {
            const userFile = data.docs[idx]?.file;
            const isMandatory = doc.requirement_level === "mandatory";
            return !isMandatory || userFile || doc.approval_status === "pending" || !!doc.uploaded_url;
        });

        if (!hasNewUpload && allRequiredSatisfied) {
            dispatch({ type: "SET_STEP_STATUS", payload: { kycDocuments: { isDone: true } } });
            setCurrentStep((prev) => prev + 1);
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("business_id", businessId);

        data.docs.forEach((doc, idx) => {
            const orig = documentList[idx];
            formData.append(`docs[${idx}][doc_id]`, orig.doc_id);
            if (doc.file) formData.append(`docs[${idx}][file]`, doc.file);
            if (doc.expires_on) {
                formData.append(
                    `docs[${idx}][expires_on]`,
                    new Date(doc.expires_on).toISOString().split("T")[0]
                );
            }
        });

        try {
            const response = await API.post("/onboarding/upload-kyc-documents", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.success) {
                const docsPayload = documentList.map((doc, idx) => ({
                    ...doc,
                    file: data.docs[idx]?.file ?? null,
                    expires_on: data.docs[idx]?.expires_on ?? null,
                }));
                dispatch({ type: "SET_FORM_DATA", payload: { kycDocuments: { docs: docsPayload } } });
                dispatch({ type: "SET_STEP_STATUS", payload: { kycDocuments: { isDone: true } } });

                if (typeof refetchFormData === "function") {
                    await refetchFormData();
                }

                setCurrentStep((prev) => prev + 1);
            } else {
                setErrorMsg(response.data.message || "Upload failed.");
            }
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || "Network error.");
        } finally {
            setLoading(false);
        }
    };

    if (!documentList.length || !fields.length) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                    {businessType ? 
                        `Loading required documents for ${businessType.replace('_', ' ')}...` : 
                        'Loading required documents...'
                    }
                </p>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {fields.map((field, idx) => {
                    const doc = documentList[idx];
                    const uploadUrl = field.uploaded_url;
                    const isApproved = doc.approval_status === "approved";
                    const isExpired = doc.expires_on ? new Date(doc.expires_on) < new Date() : false;
                    const showUpload = !isApproved || isExpired;

                    return (
                        <div key={field.id || `${doc.doc_id}-${idx}`} className="space-y-2">
                            <label className="block font-medium text-gray-800 dark:text-dark-100 mb-1">
                                {doc.doc_name} {doc.requirement_level === "optional" && "(Optional)"}
                            </label>

                            {uploadUrl && (
                                <p className="text-sm text-green-600 mb-1 flex items-center space-x-2">
                                    <a
                                        href={`${FILE_URL}/${uploadUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        {uploadUrl}
                                    </a>
                                    <Button size="sm" onClick={() => setOpenPreviewIndex(idx)}>
                                        Preview
                                    </Button>
                                    {isApproved && !isExpired && <span className="text-xs text-gray-500">(Approved)</span>}
                                    {isApproved && isExpired && <span className="text-xs text-yellow-600">(Expired)</span>}
                                </p>
                            )}

                            {showUpload && (
                                <>
                                    <Controller
                                        name={`docs.${idx}.file`}
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <DocumentUpload
                                                label={`Upload ${doc.doc_name}`}
                                                onChange={onChange}
                                                value={value}
                                                error={errors?.docs?.[idx]?.file?.message}
                                            />
                                        )}
                                    />
                                    {doc.expires_type === "date" && (
                                        <Controller
                                            name={`docs.${idx}.expires_on`}
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    label="Expiry Date"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select Expiry Date"
                                                    options={{ disableMobile: true }}
                                                    error={errors?.docs?.[idx]?.expires_on?.message}
                                                />
                                            )}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}

                {errorMsg && <p className="text-red-600">{errorMsg}</p>}

                <div className="flex justify-end space-x-3 mt-8">
                    <Button
                        type="button"
                        className="min-w-[7rem]"
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        disabled={loading}
                    >
                        Back
                    </Button>
                    <Button type="submit" color="primary" className="min-w-[7rem]" disabled={loading}>
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <GhostSpinner className="w-5 h-5 text-white" />
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            "Next"
                        )}
                    </Button>
                </div>
            </form>

            {/* Preview Modal */}
            {openPreviewIndex !== null && (
                <PreviewModal
                    open={true}
                    onClose={() => setOpenPreviewIndex(null)}
                    fileUrl={`${FILE_URL}/${documentList[openPreviewIndex].uploaded_url}`}
                    fileType={getFileType(documentList[openPreviewIndex].uploaded_url)}
                    docName={documentList[openPreviewIndex].doc_name}
                />
            )}
        </>
    );
}

KYCDocuments.propTypes = {
    setCurrentStep: PropTypes.func.isRequired,
    refetchFormData: PropTypes.func,
};
