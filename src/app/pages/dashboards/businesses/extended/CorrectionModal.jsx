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
import { useDispatch, useSelector } from "react-redux";
import { Button, Textarea } from "components/ui";
import { sendBackForCorrection } from "store/slices/businessSlice";
import { ConfirmModal } from "components/shared/ConfirmModal";

export default function CorrectionModal({ open, onClose, businessData, onSuccess }) {
    const dispatch = useDispatch();
    const closeButtonRef = useRef(null);
    const { user } = useSelector((state) => state.auth || {});

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
                        <DialogPanel className="relative flex w-full max-w-2xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
                            {/* Header */}
                            <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-6 py-4 dark:bg-dark-800">
                                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-dark-100">
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

                            {/* Content */}
                            <div className="flex flex-col px-6 py-6 space-y-6">
                                {/* Business Info */}
                                <div className="bg-gray-50 dark:bg-dark-600 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100 mb-2">
                                        Business Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-dark-300">Business Name:</span>
                                            <p className="text-gray-800 dark:text-dark-100">{businessData.business_name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-dark-300">Registration Number:</span>
                                            <p className="text-gray-800 dark:text-dark-100">{businessData.registration_number}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Correction Instructions */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                                        Correction Instructions <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-sm text-gray-600 dark:text-dark-300 mb-3">
                                        Provide detailed instructions on what needs to be corrected. This will be sent to the business owner via email.
                                    </p>
                                    <Textarea
                                        value={correctionComments}
                                        onChange={(e) => setCorrectionComments(e.target.value)}
                                        placeholder="Please provide specific details about what needs to be corrected..."
                                        rows={6}
                                        className="w-full"
                                        error={validationError}
                                    />
                                    <div className="text-xs text-gray-500 dark:text-dark-400">
                                        Minimum 10 characters required. Current: {correctionComments.length}
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                Important Notice
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>The business status will be changed to &ldquo;Sent for Corrections&rdquo;</li>
                                                    <li>An email with your instructions will be sent to the business owner</li>
                                                    <li>The business owner will need to make corrections and resubmit</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 rounded-b-lg bg-gray-50 px-6 py-4 dark:bg-dark-600">
                                <Button
                                    onClick={handleClose}
                                    variant="flat"
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
