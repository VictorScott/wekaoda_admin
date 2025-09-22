import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import {
    EllipsisHorizontalIcon,
    PencilSquareIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Button } from "components/ui";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { deleteKYCDocType, fetchKYCDocTypes } from "store/slices/kycDocTypesSlice";
import AddEditKYCDocTypeModal from "./extended/AddEditKYCDocTypeModal";
import PropTypes from "prop-types";

export function RowActions({ row, onSuccess }) {
    const dispatch = useDispatch();
    const [editModalOpen, setEditModalOpen] = useState(false);
    
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [actionSuccess, setActionSuccess] = useState(false);
    const [actionError, setActionError] = useState(false);

    const kycDocType = row.original;

    const closeModal = () => {
        setActionModalOpen(false);
        setActionError(false);
        setActionSuccess(false);
    };

    const openModal = () => {
        setActionModalOpen(true);
        setActionError(false);
        setActionSuccess(false);
    };

    const handleDelete = useCallback(async () => {
        setConfirmLoading(true);
        try {
            const response = await dispatch(deleteKYCDocType(kycDocType.id)).unwrap();

            if (response.success === false) {
                setActionError(true);
                return;
            }

            setActionSuccess(true);
            // Refresh the table data on success
            await dispatch(fetchKYCDocTypes());
            onSuccess?.();
        } catch (error) {
            console.error('KYC document type delete error:', error);
            setActionError(true);
        } finally {
            setConfirmLoading(false);
        }
    }, [dispatch, kycDocType.id, onSuccess]);

    const state = actionError ? "error" : actionSuccess ? "success" : "pending";

    return (
        <>
            <div className="flex justify-center">
                <Menu as="div" className="relative inline-block text-left">
                    <MenuButton
                        as={Button}
                        variant="flat"
                        isIcon
                        className="size-7 rounded-full"
                    >
                        <EllipsisHorizontalIcon className="size-4.5" />
                    </MenuButton>

                    <Transition
                        as={MenuItems}
                        enter="transition ease-out"
                        enterFrom="opacity-0 translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-2"
                        className="absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none ltr:right-0 rtl:left-0"
                    >
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => setEditModalOpen(true)}
                                    className={clsx(
                                        "flex h-9 w-full items-center space-x-3 px-3 tracking-wide text-gray-700 outline-hidden transition-colors dark:text-dark-100",
                                        active && "bg-gray-100/80 dark:bg-dark-600"
                                    )}
                                >
                                    <PencilSquareIcon className="size-5" />
                                    <span>Edit</span>
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={openModal}
                                    className={clsx(
                                        "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors text-error dark:text-error-light",
                                        active && "bg-error/10 dark:bg-error-light/10"
                                    )}
                                >
                                    <TrashIcon className="size-5" />
                                    <span>Delete</span>
                                </button>
                            )}
                        </MenuItem>
                    </Transition>
                </Menu>
            </div>

            <ConfirmModal
                show={actionModalOpen}
                onClose={closeModal}
                onOk={handleDelete}
                confirmLoading={confirmLoading}
                state={state}
                messages={{
                    pending: {
                        title: "Delete Document",
                        description: `Are you sure you want to delete "${kycDocType.doc_name}"? This action cannot be undone.`,
                        actionText: "Delete",
                    },
                    success: {
                        title: "Document Deleted",
                        description: `${kycDocType.doc_name} has been successfully deleted.`,
                        actionText: "Done",
                    },
                    error: {
                        title: "Operation Failed",
                        description: "Something went wrong while deleting the document type. Please try again.",
                        actionText: "Retry",
                    },
                }}
            />

            <AddEditKYCDocTypeModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                kycDocType={kycDocType}
                onSuccess={onSuccess}
            />
        </>
    );
}

RowActions.propTypes = {
    row: PropTypes.object.isRequired,
    onSuccess: PropTypes.func,
};
