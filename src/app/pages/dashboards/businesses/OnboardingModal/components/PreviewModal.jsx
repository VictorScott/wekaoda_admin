import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import PropTypes from "prop-types";
import { Button } from "components/ui";

export function PreviewModal({ open, onClose, fileUrl, fileType, docName }) {
    return (
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
                                {docName}
                            </DialogTitle>

                            {/* Close Button with X Icon */}
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                isIcon
                                className="size-7 rounded-full p-1 text-gray-600 hover:text-gray-800 dark:text-dark-200 dark:hover:text-white border-gray-300 dark:border-dark-500"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4">
                            {/* File Preview Section */}
                            <div className="mb-4 flex justify-center">
                                {fileType === "application/pdf" ? (
                                    <iframe
                                        src={fileUrl}
                                        title={docName}
                                        className="w-full min-h-[50vh] max-h-[60vh]"
                                    />
                                ) : (
                                    <img
                                        src={fileUrl}
                                        alt={docName}
                                        className="max-w-full max-h-[60vh] object-contain"
                                    />
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <Button onClick={onClose} variant="outlined">
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

PreviewModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    fileUrl: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    docName: PropTypes.string.isRequired,
};