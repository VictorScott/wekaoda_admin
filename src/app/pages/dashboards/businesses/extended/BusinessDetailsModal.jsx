import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { 
    XMarkIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    UsersIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import { Fragment, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Button, Radio, Textarea } from "components/ui";
import { submitBusinessReview, canShowVerificationActions } from "store/slices/businessSlice";
import { ConfirmModal } from "components/shared/ConfirmModal";
import DocumentReviewModal from "./DocumentReviewModal";
import CorrectionModal from "./CorrectionModal";
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
    const [correctionModalOpen, setCorrectionModalOpen] = useState(false);

    if (!businessData) return null;

    const handleCorrectionSuccess = () => {
        setCorrectionModalOpen(false);
        if (onReload) onReload();
        onClose();
    };

    // Business types that don't require directors
    const BUSINESS_TYPES_WITHOUT_DIRECTORS = ['sole_proprietorship'];
    const shouldShowDirectors = !BUSINESS_TYPES_WITHOUT_DIRECTORS.includes(businessData.business_type);

    const {
        business_id,
        business_name,
        registration_number,
        nature_of_business,
        country_of_registration,
        date_of_registration,
        business_type,
        business_type_name,
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
                        <DialogPanel className="relative flex w-full max-w-4xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
                            <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                                <DialogTitle className="text-base font-medium text-gray-800 dark:text-dark-100">
                                    Business Details
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

                        <div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                                <div className="space-y-8">
                                    {/* Business Header */}
                                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-6">
                                        <div className="flex items-start space-x-6">
                                            <div className="flex-shrink-0">
                                                <div className="size-20 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center border-4 border-white dark:border-dark-700 shadow-lg">
                                                    <BuildingOfficeIcon className="size-10 text-primary-600 dark:text-primary-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                                                            {business_name}
                                                        </h2>
                                                        <div className="flex items-center mt-2 text-gray-600 dark:text-dark-300">
                                                            <DocumentTextIcon className="size-5 mr-2" />
                                                            <span>{registration_number || 'Not provided'}</span>
                                                        </div>
                                                        {business_type_name && (
                                                            <div className="flex items-center mt-2 text-gray-600 dark:text-dark-300">
                                                                <BuildingOfficeIcon className="size-5 mr-2" />
                                                                <span>{business_type_name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Information */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg mr-3">
                                                <BuildingOfficeIcon className="size-6 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Business Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem label="Business Name" value={business_name} />
                                            <InfoItem label="Registration Number" value={registration_number} />
                                            <InfoItem label="Nature of Business" value={nature_of_business} />
                                            <InfoItem label="Country of Registration" value={country_of_registration} />
                                            <InfoItem 
                                                label="Date of Registration" 
                                                value={date_of_registration ? dayjs(date_of_registration).format("DD.MM.YYYY") : null} 
                                            />
                                            <InfoItem label="Business Type" value={business_type_name || business_type} />
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                                                <MapPinIcon className="size-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Address & Contact
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem label="Registered Office" value={registered_office} />
                                            <InfoItem label="Registered Office Address" value={registered_office_address} />
                                            <InfoItem label="Postal Address" value={postal_address} />
                                            <InfoItem label="Postal Code" value={postal_code} />
                                            <InfoItem 
                                                label="Mobile Number" 
                                                value={mobile_country_code && mobile_number ? `${mobile_country_code} ${mobile_number}` : null} 
                                            />
                                            <InfoItem label="Business Email" value={business_email} />
                                            <InfoItem label="Website" value={website_url} />
                                            <InfoItem label="Address" value={address} />
                                        </div>
                                    </div>

                                    {/* Directors Info - Only show for business types that require directors */}
                                    {shouldShowDirectors && (
                                        <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                            <div className="flex items-center mb-6">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                                                    <UsersIcon className="size-6 text-green-600 dark:text-green-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                    Directors
                                                </h3>
                                            </div>
                                            <div className="space-y-6">
                                                {directors_names && directors_names.length > 0 ? (
                                                    directors_names.map((d, i) => (
                                                        <div key={i} className="border-l-4 border-green-200 dark:border-green-800 pl-4">
                                                            <h6 className="text-sm font-semibold mb-3 text-green-700 dark:text-green-300">
                                                                Director {i + 1}
                                                            </h6>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                <InfoItem label="Name" value={d.name} />
                                                                <InfoItem label="Email" value={d.email} />
                                                                <InfoItem label="Position" value={d.position} />
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 dark:text-dark-300 italic text-sm">No directors listed.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Financial Information */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg mr-3">
                                                <CurrencyDollarIcon className="size-6 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Financial Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem label="Source of Wealth" value={source_of_wealth} />
                                            <InfoItem label="Source of Funds" value={source_of_funds} />
                                            <InfoItem label="Expected Annual Turnover" value={expected_annual_turnover} />
                                            <InfoItem label="TIN Number" value={tin_number} />
                                        </div>
                                    </div>

                                    {/* KYC Documents */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3">
                                                <DocumentTextIcon className="size-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Uploaded KYC Documents
                                            </h3>
                                        </div>
                                        {kyc_docs.length > 0 ? (
                                            <div className="space-y-4">
                                                {kyc_docs.map((doc, idx) => {
                                                    const fileUrl = doc.file
                                                        ? URL.createObjectURL(doc.file)
                                                        : `${FILE_URL}/${doc.url}`;
                                                    const isPdf =
                                                        doc.file?.type === "application/pdf" ||
                                                        doc.url?.toLowerCase().endsWith(".pdf");
                                                    const fileType =
                                                        doc.file?.type || (isPdf ? "application/pdf" : "image");

                                                    const getStatusIcon = (status) => {
                                                        if (status === "approved") return <CheckCircleIcon className="size-5 text-green-500" />;
                                                        if (status === "declined") return <XCircleIcon className="size-5 text-red-500" />;
                                                        return <ClockIcon className="size-5 text-yellow-500" />;
                                                    };

                                                    const getStatusColor = (status) => {
                                                        if (status === "approved") return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
                                                        if (status === "declined") return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
                                                        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
                                                    };

                                                    return (
                                                        <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex-shrink-0">
                                                                    {getStatusIcon(doc.approval_status)}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-dark-100">
                                                                        {doc.doc_name}
                                                                    </h4>
                                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(doc.approval_status)}`}>
                                                                        {doc.approval_status || "Pending"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
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
                                                                    <span className="text-sm italic text-gray-500 dark:text-dark-300">
                                                                        No file
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm italic text-gray-500 dark:text-dark-300">
                                                No documents uploaded.
                                            </p>
                                        )}
                                    </div>

                                    {/* Review Action - Only show if verification actions are allowed */}
                                    {canShowVerificationActions(businessData) && (
                                        <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                            <div className="flex items-center mb-6">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg mr-3">
                                                    <CheckCircleIcon className="size-6 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                    Business Review
                                                </h3>
                                            </div>
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
                                            </div>
                                        </div>
                                    )}
                                </div>
                        </div>

                        {/* Footer */}
                        <div className="space-x-3 flex justify-end rounded-b-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                className="min-w-[7rem]"
                            >
                                Close
                            </Button>
                            {canShowVerificationActions(businessData) && reviewStatus === "declined" && (
                                <Button
                                    onClick={() => setCorrectionModalOpen(true)}
                                    color="warning"
                                    className="min-w-[7rem]"
                                    disabled={submitting}
                                >
                                    Send Back for Correction
                                </Button>
                            )}
                            {canShowVerificationActions(businessData) && reviewStatus && (
                                <Button
                                    onClick={handleReviewSubmit}
                                    color={reviewStatus === "verified" ? "success" : "error"}
                                    className="min-w-[7rem]"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Processing..."
                                        : reviewStatus === "verified"
                                            ? "Approve"
                                            : "Decline"}
                                </Button>
                            )}
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

            {/* Correction Modal */}
            <CorrectionModal
                open={correctionModalOpen}
                onClose={() => setCorrectionModalOpen(false)}
                businessData={businessData}
                onSuccess={handleCorrectionSuccess}
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

function InfoItem({ label, value }) {
    return (
        <div className="flex items-start">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-dark-200">{label}</p>
                <p className="text-gray-900 dark:text-dark-100 mt-1">
                    {value ? (
                        <span>{value}</span>
                    ) : (
                        <span className="text-gray-500 dark:text-dark-300 italic">Not provided</span>
                    )}
                </p>
            </div>
        </div>
    );
}

InfoItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
