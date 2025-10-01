import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { 
    XMarkIcon,
    ExclamationTriangleIcon,
    BuildingOfficeIcon,
    PencilSquareIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";
import { Fragment, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Button, Textarea } from "components/ui";
import { sendBackForCorrection } from "store/slices/businessSlice";
import { ConfirmModal } from "components/shared/ConfirmModal";

export default function CorrectionModal({ open, onClose, businessData, onSuccess }) {
    const dispatch = useDispatch();
    const closeButtonRef = useRef(null);
    
    // Memoized selector to prevent unnecessary rerenders
    const user = useSelector((state) => state.auth?.user, (left, right) => left === right);

    const [correctionComments, setCorrectionComments] = useState("");
    const [validationError, setValidationError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmState, setConfirmState] = useState("pending");
    const [errorMessage, setErrorMessage] = useState("");

    if (!businessData) return null;

    const handleSubmit = () => {
        setValidationError("");

        if (!correctionComments.trim()) {
            setValidationError("Correction instructions are required");
            return;
        }

        if (correctionComments.trim().length < 10) {
            setValidationError("Correction instructions must be at least 10 characters long");
            return;
        }

        setConfirmOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setSubmitting(true);
        setConfirmState("pending");
        setErrorMessage("");

        try {
            const adminName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Admin' : 'Admin';
            
            const result = await dispatch(sendBackForCorrection({
                business_id: businessData.business_id,
                correction_comments: correctionComments.trim(),
                admin_name: adminName,
            })).unwrap();

            if (result.success) {
                setConfirmState("success");
                setTimeout(() => {
                    handleClose();
                    if (onSuccess) onSuccess();
                }, 2000);
            } else {
                setConfirmState("error");
                setErrorMessage(result.message || "Failed to send correction instructions");
            }
        } catch (error) {
            setConfirmState("error");
            // Handle different error formats
            let errorMsg = "Failed to send correction instructions";
            if (typeof error === 'string') {
                errorMsg = error;
            } else if (error?.message) {
                errorMsg = error.message;
            } else if (error?.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            setErrorMessage(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setCorrectionComments("");
        setValidationError("");
        setErrorMessage("");
        setConfirmState("pending");
        setConfirmOpen(false);
        onClose();
    };

    const closeConfirmModal = () => {
        if (confirmState === "success") {
            handleClose();
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
                    onClose={handleClose}
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
                                    Send Back for Corrections
                                </DialogTitle>
                                <Button
                                    onClick={handleClose}
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
                                                            {businessData.business_name}
                                                        </h2>
                                                        <div className="flex items-center mt-2 text-gray-600 dark:text-dark-300">
                                                            <PencilSquareIcon className="size-5 mr-2" />
                                                            <span>{businessData.registration_number || 'Not provided'}</span>
                                                        </div>
                                                        <div className="flex items-center mt-2 text-gray-600 dark:text-dark-300">
                                                            <ExclamationTriangleIcon className="size-5 mr-2" />
                                                            <span>Send Back for Corrections</span>
                                                        </div>
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
                                            <div className="flex items-start">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Business Name</p>
                                                    <p className="text-gray-900 dark:text-dark-100 mt-1">
                                                        {businessData.business_name || <span className="text-gray-500 dark:text-dark-300 italic">Not provided</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Registration Number</p>
                                                    <p className="text-gray-900 dark:text-dark-100 mt-1">
                                                        {businessData.registration_number || <span className="text-gray-500 dark:text-dark-300 italic">Not provided</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Correction Instructions */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                                                <PencilSquareIcon className="size-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Correction Instructions
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600 dark:text-dark-300">
                                                Provide detailed instructions on what needs to be corrected. This will be sent to the business owner via email.
                                            </p>
                                            <Textarea
                                                label="Instructions"
                                                value={correctionComments}
                                                onChange={(e) => setCorrectionComments(e.target.value)}
                                                placeholder="Please provide specific details about what needs to be corrected..."
                                                rows={6}
                                                className="w-full"
                                                error={validationError}
                                                required
                                            />
                                            <div className="text-xs text-gray-500 dark:text-dark-400">
                                                Minimum 10 characters required. Current: {correctionComments.length}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Important Notice */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg mr-3">
                                                <InformationCircleIcon className="size-6 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Important Notice
                                            </h3>
                                        </div>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                            <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                                <ul className="list-disc list-inside space-y-2">
                                                    <li>The business status will be changed to &ldquo;Sent for Corrections&rdquo;</li>
                                                    <li>An email with your instructions will be sent to the business owner</li>
                                                    <li>The business owner will need to make corrections and resubmit</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        <div className="space-x-3 flex justify-end rounded-b-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                                <Button
                                    onClick={handleClose}
                                    variant="outlined"
                                    className="min-w-[7rem]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    color="warning"
                                    className="min-w-[7rem]"
                                    disabled={!correctionComments.trim() || correctionComments.trim().length < 10}
                                >
                                    Send for Corrections
                                </Button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>

            <ConfirmModal
                show={confirmOpen}
                onClose={closeConfirmModal}
                onOk={handleConfirmSubmit}
                confirmLoading={submitting}
                state={confirmState}
                messages={{
                    pending: {
                        title: "Send Back for Corrections",
                        description: `Are you sure you want to send "${businessData.business_name}" back for corrections? This will notify the business owner via email.`,
                        actionText: "Send for Corrections",
                    },
                    success: {
                        title: "Corrections Sent Successfully",
                        description: `${businessData.business_name} has been sent back for corrections. The business owner will receive an email with your instructions.`,
                        actionText: "Done",
                    },
                    error: {
                        title: "Operation Failed",
                        description: errorMessage || "Failed to send correction instructions. Please try again.",
                        actionText: "Close",
                    },
                }}
            />
        </>
    );
}

CorrectionModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    businessData: PropTypes.object,
    onSuccess: PropTypes.func,
};
