import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Button, Radio, Textarea } from "components/ui";
import { submitBusinessReview } from "store/slices/businessSlice";
import { ConfirmModal } from "components/shared/ConfirmModal";
import DocumentReviewModal from "./DocumentReviewModal";
import { FILE_URL } from "../../../../../configs/auth.config";
import dayjs from "dayjs";

export default function BusinessDetailsModal({ open, onClose, businessData, onReload }) {
    const dispatch = useDispatch();
    const closeButtonRef = useRef(null);

    const [reviewStatus, setReviewStatus] = useState(null);
    const [reviewComment, setReviewComment] = useState("");
    const [validationError, setValidationError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmState, setConfirmState] = useState("pending");
    const [errorMessage, setErrorMessage] = useState("");
    const [openDocIndex, setOpenDocIndex] = useState(null);

    if (!businessData) return null;

    const {
        business_id,
        business_name,
        registration_number,
        nature_of_business,
        country_of_registration,
        date_of_registration,
        business_type,
        registered_office,
        registered_office_address,
        postal_address,
        postal_code,
        mobile_country_code,
        mobile_number,
        business_email,
        website_url,
        address,
        directors_names = [],
        source_of_wealth,
        source_of_funds,
        expected_annual_turnover,
        tin_number,
        kyc_docs = [],
    } = businessData;

    const handleReviewSubmit = () => {
        setValidationError("");
        if (reviewStatus === "declined" && !reviewComment.trim()) {
            setValidationError("Comment is required when declining.");
            return;
        }
        setConfirmOpen(true);
        setConfirmState("pending");
    };

    const handleConfirmAction = async () => {
        setSubmitting(true);
        try {
            await dispatch(
                submitBusinessReview({
                    business_id,
                    action: reviewStatus,
                    comments: reviewComment,
                })
            ).unwrap();
            setConfirmState("success");
            onReload?.();
        } catch (err) {
            console.log(err);
            setConfirmState("error");
            setErrorMessage("Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmClose = () => {
        if (confirmState === "success") {
            setReviewComment("");
            setReviewStatus("verified");
            setConfirmOpen(false);
            onClose();
        } else {
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <Transition appear show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
                    onClose={onClose}
                    initialFocus={closeButtonRef}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
                    </TransitionChild>

                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="relative flex w-full max-w-7xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700 max-h-[90vh]">
                            {/* Header with close */}
                            <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-6 py-4 dark:bg-dark-800">
                                <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-dark-100">
                                    {business_name}
                                </DialogTitle>
                                <Button
                                    onClick={onClose}
                                    variant="flat"
                                    isIcon
                                    className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                                    ref={closeButtonRef}
                                >
                                    <XMarkIcon className="size-4.5" />
                                </Button>
                            </div>

                            {/* Modal content scrollable */}
                            <div className="flex flex-col overflow-y-auto px-8 py-6 space-y-8 max-h-[calc(90vh-72px)]">
                                {/* Business Info */}
                                <Section title="Business Details">
                                    <InfoGrid
                                        data={{
                                            "Business Name": business_name,
                                            "Registration Number": registration_number,
                                            "Nature of Business": nature_of_business,
                                            "Country of Registration": country_of_registration,
                                            "Date of Registration": date_of_registration
                                                ? dayjs(date_of_registration).format("DD.MM.YYYY")
                                                : "---",
                                            "Business Type": business_type,
                                        }}
                                    />
                                </Section>

                                {/* Address Info */}
                                <Section title="Business Address">
                                    <InfoGrid
                                        data={{
                                            "Registered Office": registered_office,
                                            "Registered Office Address": registered_office_address,
                                            "Postal Address": postal_address,
                                            "Postal Code": postal_code,
                                            "Mobile Number":
                                                mobile_country_code && mobile_number
                                                    ? `${mobile_country_code} ${mobile_number}`
                                                    : "---",
                                            "Business Email": business_email,
                                            Website: website_url,
                                            Address: address,
                                        }}
                                    />
                                </Section>

                                {/* Directors Info */}
                                <Section title="Directors">
                                    {directors_names.length > 0 ? (
                                        directors_names.map((d, i) => (
                                            <div key={i} className="mb-4">
                                                <h6 className="text-sm font-semibold mb-1">
                                                    Director {i + 1}
                                                </h6>
                                                <InfoGrid
                                                    data={{
                                                        Name: d.name,
                                                        Email: d.email,
                                                        Position: d.position,
                                                    }}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic text-sm">No directors listed.</p>
                                    )}
                                </Section>

                                {/* Financial Info */}
                                <Section title="Financial Info">
                                    <InfoGrid
                                        data={{
                                            "Source of Wealth": source_of_wealth,
                                            "Source of Funds": source_of_funds,
                                            "Expected Annual Turnover": expected_annual_turnover,
                                            "TIN Number": tin_number,
                                        }}
                                    />
                                </Section>

                                {/* KYC Documents */}
                                <Section title="Uploaded KYC Documents">
                                    {kyc_docs.length > 0 ? (
                                        <table className="w-full">
                                            <tbody>
                                            {kyc_docs.map((doc, idx) => {
                                                const fileUrl = doc.file
                                                    ? URL.createObjectURL(doc.file)
                                                    : `${FILE_URL}/${doc.url}`;
                                                const isPdf =
                                                    doc.file?.type === "application/pdf" ||
                                                    doc.url?.toLowerCase().endsWith(".pdf");
                                                const fileType =
                                                    doc.file?.type || (isPdf ? "application/pdf" : "image");

                                                const badgeColor =
                                                    doc.approval_status === "approved"
                                                        ? "bg-green-500"
                                                        : doc.approval_status === "declined"
                                                            ? "bg-red-500"
                                                            : "bg-yellow-500";

                                                return (
                                                    <tr key={idx} className="border-b border-gray-200 dark:border-dark-500 last:border-b-0">
                                                        <td className="py-2 pr-4 text-sm font-medium">
                                                            {doc.doc_name}
                                                        </td>
                                                        <td className="py-2 pr-4 text-sm">
                                                            <span
                                                                className={`text-white text-xs px-2 py-1 rounded-full ${badgeColor}`}
                                                            >
                                                              {doc.approval_status || "Pending"}
                                                            </span>
                                                        </td>
                                                        <td className="py-2">
                                                            {doc.file || doc.url ? (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => setOpenDocIndex(idx)}
                                                                    >
                                                                        Preview
                                                                    </Button>
                                                                    <DocumentReviewModal
                                                                        open={openDocIndex === idx}
                                                                        onClose={() => setOpenDocIndex(null)}
                                                                        fileUrl={fileUrl}
                                                                        fileType={fileType}
                                                                        document={doc}
                                                                        onReload={onReload}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <span className="text-sm italic text-gray-500">
                                                                  No file
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-sm italic text-gray-500">
                                            No documents uploaded.
                                        </p>
                                    )}
                                </Section>

                                {/* Review Action */}
                                <Section title="Business Review">
                                    <div className="space-y-4">
                                        <div className="flex gap-6">
                                            <Radio
                                                label="Verified"
                                                name="business-review-status"
                                                value="verified"
                                                checked={reviewStatus === "verified"}
                                                onChange={() => setReviewStatus("verified")}
                                            />
                                            <Radio
                                                label="Declined"
                                                name="business-review-status"
                                                value="declined"
                                                checked={reviewStatus === "declined"}
                                                onChange={() => setReviewStatus("declined")}
                                            />
                                        </div>

                                        <Textarea
                                            label="Comment"
                                            placeholder="Enter comment..."
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            rows={4}
                                        />

                                        {validationError && (
                                            <p className="text-sm text-red-500">{validationError}</p>
                                        )}

                                        <div className="flex justify-end gap-3">
                                            <Button onClick={onClose} variant="outlined">
                                                Close
                                            </Button>
                                            <Button
                                                onClick={handleReviewSubmit}
                                                color={reviewStatus === "verified" ? "success" : "error"}
                                                disabled={submitting}
                                            >
                                                {submitting
                                                    ? "Submitting..."
                                                    : reviewStatus === "verified"
                                                        ? "Approve"
                                                        : "Decline"}
                                            </Button>
                                        </div>
                                    </div>
                                </Section>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>

            {/* Confirmation Modal */}
            <ConfirmModal
                show={confirmOpen}
                onClose={handleConfirmClose}
                onOk={handleConfirmAction}
                confirmLoading={submitting}
                state={confirmState}
                messages={{
                    pending: {
                        title: `Confirm Business ${
                            reviewStatus === "verified" ? "Verification" : "Decline"
                        }`,
                        description: "Are you sure?",
                        actionText: "Confirm",
                    },
                    success: {
                        title: `Business ${
                            reviewStatus === "verified" ? "Verified" : "Declined"
                        }`,
                        description: "Operation successful.",
                        actionText: "Done",
                    },
                    error: {
                        title: "Failed",
                        description: errorMessage || "Please try again.",
                        actionText: "Retry",
                    },
                }}
            />
        </>
    );
}

BusinessDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    businessData: PropTypes.object.isRequired,
    onReload: PropTypes.func,
};

function Section({ title, children }) {
    return (
        <div className="mt-6">
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
