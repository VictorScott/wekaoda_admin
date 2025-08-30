import { Button, Textarea, Radio } from "components/ui";
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
import { Fragment, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline"; // Import the X icon
import PropTypes from "prop-types";

export default function DocumentReviewModal({ open, onClose, document, fileUrl, fileType }) {
    const [status, setStatus] = useState(null);
    const [comments, setComments] = useState("");
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmState, setConfirmState] = useState("pending");
    const [errorMessage, setErrorMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState(null);

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
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
                    onClose={onClose}
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
                        <DialogPanel className="relative w-full max-w-4xl bg-white rounded-lg dark:bg-dark-700">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between bg-gray-200 px-4 py-3 rounded-t-lg dark:bg-dark-800">
                                <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-dark-100">
                                    {document.doc_name}
                                </DialogTitle>

                                {/* Close Button with X Icon */}
                                <Button
                                    onClick={onClose}
                                    variant="flat"
                                    isIcon
                                    className="size-7 rounded-full p-1 text-gray-600 hover:text-gray-800 dark:text-dark-200 dark:hover:text-white"
                                >
                                    <XMarkIcon className="w-5 h-5" /> {/* X Icon */}
                                </Button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-4">
                                {/* File Preview Section */}
                                <div className="mb-4 flex justify-center">
                                    {fileType === "application/pdf" ? (
                                        <iframe
                                            src={fileUrl}
                                            title={document.doc_name}
                                            className="w-full min-h-[50vh] max-h-[60vh]"
                                        />
                                    ) : (
                                        <img
                                            src={fileUrl}
                                            alt={document.doc_name}
                                            className="max-w-full max-h-[60vh] object-contain"
                                        />
                                    )}
                                </div>

                                {/* Status Selection and Comments */}
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

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <Button onClick={onClose} variant="flat" disabled={submitting}>
                                            Close
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            color={status === "approved" ? "success" : "error"}
                                            disabled={submitting}
                                        >
                                            {status === "approved" ? "Approve" : "Decline"}
                                        </Button>
                                    </div>
                                </div>
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
