import { useState } from "react";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import {
    Button,
    GhostSpinner,
} from "components/ui";
import { countries } from "constants/countries.constant.js";
import { useOnboardingFormContext } from "../OnboardingFormContext.js";
import { declarationSchema } from "../schema.js";
import { PreviewModal } from "../components/PreviewModal.jsx";
import { FILE_URL } from "configs/auth.config.js";
import { toast } from "sonner";
import API from "utils/api";

// Business type mapping for display names (fallback only)
const businessTypeLabels = {
    "sole_proprietorship": "Sole Proprietorship",
    "partnership": "Partnership", 
    "private_limited": "Private Limited",
    "public_limited": "Public Limited",
    "non_profit": "Non-profit",
};

export function Declaration({ setCurrentStep, onSuccess }) {
    const kycFormCtx = useOnboardingFormContext();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [openDocIndex, setOpenDocIndex] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const {
        handleSubmit,
    } = useForm({
        resolver: yupResolver(declarationSchema),
        defaultValues: {},
    });

    const {
        businessDetails = {},
        businessAddress = {},
        directors_names = {},
        financialInfo = {},
        kycDocuments = { docs: [] },
        meta = {},
    } = kycFormCtx?.state?.formData ?? {};

    // Business types that don't require directors
    const BUSINESS_TYPES_WITHOUT_DIRECTORS = ['sole_proprietorship'];
    
    // Check if current business type requires directors
    const businessType = businessDetails.businessType || meta.business_type;
    const shouldShowDirectors = !BUSINESS_TYPES_WITHOUT_DIRECTORS.includes(businessType);

    const onSubmit = async () => {
        // Prevent multiple submissions
        if (loading || isCompleted) {
            return;
        }

        setLoading(true);
        setErrorMsg("");

        const payload = {
            business_id: kycFormCtx.state.businessId,
        };

        try {
            const res = await API.post("/onboarding/complete", payload);

            if (res.data?.success) {
                setIsCompleted(true); // Mark as completed to prevent resubmission
                
                toast.success(res.data.message || "Business onboarding completed successfully!", { className: "soft-color" });

                kycFormCtx.dispatch({
                    type: "SET_FORM_DATA",
                    payload: { declaration: { completed: true } },
                });

                kycFormCtx.dispatch({
                    type: "SET_STEP_STATUS",
                    payload: { declaration: { isDone: true } },
                });

                // Close modal and refresh table after a short delay to show success message
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess();
                    }
                }, 2000);
            } else {
                setErrorMsg(res.data?.message || "Failed to complete onboarding.");
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="max-w-3xl">
            {/* Business Details */}
            <Section title="Business Details">
                <InfoGrid
                    data={{
                        "Business Name": businessDetails.businessName,
                        "Registration Number": businessDetails.registrationNumber,
                        "Nature of Business": businessDetails.natureOfBusiness,
                        "Country of Registration":
                            countries.find((c) => c.code === businessDetails.countryOfRegistration)?.name ?? "---",
                        "Date of Registration": businessDetails.dateOfRegistration
                            ? dayjs(businessDetails.dateOfRegistration).format("DD.MM.YYYY")
                            : "---",
                        "Business Type": meta.business_type_name || businessTypeLabels[businessDetails.businessType] || businessDetails.businessType,
                    }}
                />
            </Section>

            {/* Business Address */}
            <Section title="Business Address">
                <InfoGrid
                    data={{
                        "Registered Office": businessAddress.registeredOffice,
                        "Registered Office Address": businessAddress.registeredOfficeAddress,
                        "Postal Address": businessAddress.postalAddress,
                        "Postal Code": businessAddress.postalCode,
                        "Mobile Number":
                            businessAddress.dialCode && businessAddress.phone
                                ? `${businessAddress.dialCode} ${businessAddress.phone}`
                                : "---",
                        "Business Email": businessAddress.businessEmail,
                        "Website": businessAddress.websiteUrl || "---",
                        "Address": businessAddress.address,
                    }}
                />
            </Section>

            {/* Directors - Only show for business types that require directors */}
            {shouldShowDirectors && (
                <Section title="Directors">
                    {Array.isArray(directors_names) && directors_names.length > 0 ? (
                        directors_names.map((d, i) => (
                            <div key={i} className="mb-4">
                                <h6 className="text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                                    Director {i + 1}
                                </h6>
                                <InfoGrid
                                    data={{
                                        Name: d.name || "---",
                                        Email: d.email || "---",
                                        Position: d.position || "---",
                                    }}
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic text-sm">No directors listed.</p>
                    )}
                </Section>
            )}

            {/* Financial Info */}
            <Section title="Financial Info">
                <InfoGrid
                    data={{
                        "Source of Wealth": financialInfo.source_of_wealth,
                        "Source of Funds": financialInfo.source_of_funds,
                        "Expected Annual Turnover": financialInfo.expected_annual_turnover,
                        "TIN Number": financialInfo.tinNumber || "---",
                    }}
                />
            </Section>

            {/* KYC Documents */}
            <Section title="Uploaded KYC Documents">
                {kycDocuments.docs?.length > 0 ? (
                    <table className="w-full border-collapse">
                        <tbody>
                        {kycDocuments.docs.map((doc, idx) => {
                            const localFile = doc.file;
                            const remoteUrl = doc.url;
                            const isPdf =
                                localFile?.type === "application/pdf" ||
                                remoteUrl?.toLowerCase().endsWith(".pdf");

                            const fileUrl = localFile
                                ? URL.createObjectURL(localFile)
                                : `${FILE_URL}/${remoteUrl}`;

                            const fileType = localFile?.type || (isPdf ? "application/pdf" : "image");

                            return (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-600">
                                    <td className="py-2 pr-4 text-sm font-medium text-gray-800 dark:text-dark-100 whitespace-nowrap">
                                        {doc.doc_name}
                                    </td>
                                    <td className="py-2">
                                        {(localFile || remoteUrl) ? (
                                            <>
                                                <Button onClick={() => setOpenDocIndex(idx)} size="sm">
                                                    Preview
                                                </Button>

                                                <PreviewModal
                                                    open={openDocIndex === idx}
                                                    onClose={() => setOpenDocIndex(null)}
                                                    fileUrl={fileUrl}
                                                    fileType={fileType}
                                                    docName={doc.doc_name}
                                                />
                                            </>
                                        ) : (
                                            <span className="text-gray-500 italic text-sm">No file uploaded</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 italic text-sm">No documents uploaded.</p>
                )}
            </Section>

            {/* Completion */}
            <Section title="Completion">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 dark:bg-green-900/20 dark:border-green-800">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                Ready to Complete Business Onboarding
                            </h3>
                            <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                <p>
                                    All required information has been collected. Click &ldquo;Complete Onboarding&rdquo; to:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Create business administrator accounts</li>
                                    <li>Send welcome emails with login credentials</li>
                                    <li>Auto-verify the business and all documents</li>
                                    <li>Activate the business account</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {errorMsg && <div className="mt-6 text-red-600">{errorMsg}</div>}

            {/* Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
                <Button
                    type="button"
                    className="min-w-[7rem]"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    disabled={loading}
                >
                    Back
                </Button>
                <Button type="submit" className="min-w-[10rem]" color="primary" disabled={loading || isCompleted}>
                    {isCompleted ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Completed</span>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <GhostSpinner className="size-4 border-2" />
                            <span>Completing...</span>
                        </div>
                    ) : (
                        "Complete Onboarding"
                    )}
                </Button>
            </div>
        </form>
    );
}


function Section({ title, children }) {
    return (
        <div className="mt-8">
            <h6 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-700 dark:border-dark-500 dark:text-dark-200">
                {title}
            </h6>
            <div className="mt-4">{children}</div>
        </div>
    );
}

Section.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

function InfoGrid({ data }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {Object.entries(data).map(([label, value]) => (
                <div key={label}>
                    <p className="text-sm font-medium text-gray-800 dark:text-dark-100">{label}:</p>
                    <p>{value ?? "---"}</p>
                </div>
            ))}
        </div>
    );
}

InfoGrid.propTypes = {
    data: PropTypes.object.isRequired,
};

Declaration.propTypes = {
    setCurrentStep: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
};
