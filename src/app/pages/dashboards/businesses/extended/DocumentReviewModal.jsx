import { Button, Textarea, Radio, Badge } from "components/ui";
import { useDispatch } from "react-redux";
import { updateDocumentStatusInStore, updateKYCStatus } from "store/slices/businessSlice";
import { ConfirmModal } from "components/shared/ConfirmModal";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
import { 
    XMarkIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

export default function DocumentReviewModal({ open, onClose, document, fileUrl, fileType }) {
    const [status, setStatus] = useState(null);
    const [comments, setComments] = useState("");
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmState, setConfirmState] = useState("pending");
    const [errorMessage, setErrorMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const closeButtonRef = useRef(null);

    const dispatch = useDispatch();

    const handleSubmit = () => {
        setValidationError(null);

        if (!status) {
            setValidationError("Please select a status.");
            return;
        }

        if (status === "declined" && !comments.trim()) {
            setValidationError("Comments are required when declining a document.");
            return;
        }

        setConfirmState("pending");
        setErrorMessage(null);
        setConfirmModalOpen(true);
    };

    const handleConfirmAction = async () => {
        setSubmitting(true);
        setErrorMessage(null);

        try {
            await dispatch(
                updateKYCStatus({
                    doc_id: document.id,
                    action: status,
                    comments,
                })
            ).unwrap();

            dispatch(
                updateDocumentStatusInStore({
                    businessId: document.business_id,
                    docId: document.id,
                    status,
                })
            );

            setConfirmState("success");
        } catch (err) {
            console.error(err);
            setErrorMessage("Failed to update KYC status. Please try again.");
            setConfirmState("error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmClose = () => {
        if (confirmState === "success") {
            setConfirmModalOpen(false);
            onClose();
            setStatus(null);
            setComments("");
        } else {
            setConfirmModalOpen(false);
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
                    {/* Backdrop with blur */}
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

                    {/* Modal panel with scale + fade */}
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
                                    Document Review
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
                                    {/* Document Header */}
                                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-6">
                                        <div className="flex items-start space-x-6">
                                            <div className="flex-shrink-0">
                                                <div className="size-20 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center border-4 border-white dark:border-dark-700 shadow-lg">
                                                    <DocumentTextIcon className="size-10 text-primary-600 dark:text-primary-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                                                            {document.doc_name}
                                                        </h2>
                                                        <div className="flex items-center mt-2 text-gray-600 dark:text-dark-300">
                                                            <EyeIcon className="size-5 mr-2" />
                                                            <span>Document Review</span>
                                                        </div>
                                                        {document.approval_status && (
                                                            <div className="mt-2">
                                                                <Badge 
                                                                    color={document.approval_status === 'approved' ? 'success' : document.approval_status === 'declined' ? 'error' : 'warning'}
                                                                    size="sm"
                                                                >
                                                                    {document.approval_status === 'approved' && <CheckCircleIcon className="size-4 mr-1" />}
                                                                    {document.approval_status === 'declined' && <XCircleIcon className="size-4 mr-1" />}
                                                                    {document.approval_status || 'Pending'}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Preview Section */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                                                <EyeIcon className="size-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Document Preview
                                            </h3>
                                        </div>
                                        <div className="flex justify-center bg-gray-50 dark:bg-dark-600 rounded-lg p-4">
                                            {fileType === "application/pdf" ? (
                                                <iframe
                                                    src={fileUrl}
                                                    title={document.doc_name}
                                                    className="w-full min-h-[50vh] max-h-[60vh] rounded-lg"
                                                />
                                            ) : (
                                                <img
                                                    src={fileUrl}
                                                    alt={document.doc_name}
                                                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Review Section */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                                                <CheckCircleIcon className="size-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Document Review
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex space-x-6">
                                                <Radio
                                                    label="Approved"
                                                    name="review-status"
                                                    value="approved"
                                                    checked={status === "approved"}
                                                    onChange={() => setStatus("approved")}
                                                />
                                                <Radio
                                                    label="Declined"
                                                    name="review-status"
                                                    value="declined"
                                                    checked={status === "declined"}
                                                    onChange={() => setStatus("declined")}
                                                />
                                            </div>

                                            <Textarea
                                                label="Comments"
                                                placeholder="Enter comments here..."
                                                value={comments}
                                                onChange={(e) => setComments(e.target.value)}
                                                rows={5}
                                            />

                                            {validationError && (
                                                <div className="text-red-500 text-sm">{validationError}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        <div className="space-x-3 flex justify-end rounded-b-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                className="min-w-[7rem]"
                                disabled={submitting}
                            >
                                Close
                            </Button>
                            {status && (
                                <Button
                                    onClick={handleSubmit}
                                    color={status === "approved" ? "success" : "error"}
                                    className="min-w-[7rem]"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Processing..."
                                        : status === "approved"
                                            ? "Approve"
                                            : "Decline"}
                                </Button>
                            )}
                        </div>
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>

            <ConfirmModal
                show={confirmModalOpen}
                onClose={handleConfirmClose}
                onOk={handleConfirmAction}
                confirmLoading={submitting}
                state={confirmState}
                messages={{
                    pending: {
                        title: `Confirm KYC Document ${status === "approved" ? "Approval" : "Decline"}`,
                        description: `Are you sure you want to ${status === "approved" ? "approve" : "decline"} this document?`,
                        actionText: "Confirm",
                    },
                    success: {
                        title: `KYC Document ${status === "approved" ? "Approved" : "Declined"}`,
                        description: `The document has been successfully ${status === "approved" ? "approved" : "declined"}.`,
                        actionText: "Done",
                    },
                    error: {
                        title: "Operation Failed",
                        description: errorMessage || "Something went wrong while updating the KYC status. Please try again.",
                        actionText: "Retry",
                    },
                }}
            />
        </>
    );
}

DocumentReviewModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    document: PropTypes.object.isRequired,
    fileUrl: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
};
