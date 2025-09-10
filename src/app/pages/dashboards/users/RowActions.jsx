import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  EllipsisHorizontalIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  PauseCircleIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import { Button } from "components/ui";
import { ConfirmModal } from "components/shared/ConfirmModal";
import AddEditUserModal from "./extended/AddEditUserModal.jsx";
import {fetchUsers, updateUserStatus} from "store/slices/usersSlice";

export function RowActions({ row, onSuccess }) {

  const dispatch = useDispatch();
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionError, setActionError] = useState(false);

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

  const handleStatusToggle = useCallback(async () => {
    setConfirmLoading(true);
    try {
      const currentStatus = row.original.status;
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      const userId = row.original.id;

      await dispatch(
        updateUserStatus({
          user_id: userId,
          status: newStatus,
        })
      ).unwrap();
      
      setActionSuccess(true);
      // Refresh the table data on success
      await dispatch(fetchUsers());
      onSuccess?.();
    } catch (error) {
      console.error('User status update error:', error);
      setActionError(true);
    } finally {
      setConfirmLoading(false);
    }
  }, [dispatch, row, onSuccess]);

  const state = actionError ? "error" : actionSuccess ? "success" : "pending";
  const isActive = row.original.status === "active";
  const actionLabel = isActive ? "Suspend" : "Activate";
  const ActionIcon = isActive ? PauseCircleIcon : PlayCircleIcon;
  const actionColor = isActive
      ? "text-error dark:text-error-light"
      : "text-success dark:text-success-light";
  const actionBg = isActive
      ? "bg-error/10 dark:bg-error-light/10"
      : "bg-success/10 dark:bg-success-light/10";

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
                            "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                            actionColor,
                            active && actionBg
                        )}
                    >
                      <ActionIcon className="size-5" />
                      <span>{actionLabel}</span>
                    </button>
                )}
              </MenuItem>
            </Transition>
          </Menu>
        </div>

        <ConfirmModal
          show={actionModalOpen}
          onClose={closeModal}
          onOk={handleStatusToggle}
          confirmLoading={confirmLoading}
          state={state}
          messages={{
            pending: {
              title: `${actionLabel} User`,
              description: `Are you sure you want to ${actionLabel.toLowerCase()} ${row.original.name}?`,
              actionText: actionLabel,
            },
            success: {
              title: `User ${isActive ? "Suspended" : "Activated"}`,
              description: `${row.original.name} has been successfully ${isActive ? "suspended" : "activated"}.`,
              actionText: "Done",
            },
            error: {
              title: "Operation Failed",
              description: "Something went wrong while updating the user status. Please try again.",
              actionText: "Retry",
            },
          }}
        />

        <AddEditUserModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={row.original}
          onSuccess={onSuccess}
        />
      </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};
