import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
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
import { toast } from "sonner";
import { Button, GhostSpinner } from "components/ui";
import AddEditUserModal from "./extended/AddEditUserModal.jsx";
import {fetchUsers, updateUserStatus, setActionLoading} from "store/slices/usersSlice";

export function RowActions({ row, onSuccess }) {

  const dispatch = useDispatch();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { actionLoading } = useSelector((state) => state.users);
  
  const userId = row.original.id;
  const isActionLoading = actionLoading[userId];

  const handleStatusToggle = useCallback(async () => {
    const currentStatus = row.original.status;
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const actionText = newStatus === "active" ? "activated" : "suspended";

    // Set loading state for this specific user
    dispatch(setActionLoading({ userId, loading: true }));

    const statusPromise = dispatch(
        updateUserStatus({
          user_id: userId,
          status: newStatus,
        })
    ).unwrap().then(async () => {
      // Refresh the table data on success
      await dispatch(fetchUsers());
      onSuccess?.();
    }).finally(() => {
      // Clear loading state
      dispatch(setActionLoading({ userId, loading: false }));
    });

    // Use toast.promise for better UX
    toast.promise(statusPromise, {
      loading: `${newStatus === "active" ? "Activating" : "Suspending"} user...`,
      success: `User ${actionText} successfully!`,
      error: (error) => {
        const errors = error?.errors;
        if (errors) {
          return Object.values(errors).flat()[0] || "Something went wrong.";
        }
        return error?.message || "Something went wrong.";
      },
    });

  }, [dispatch, row, onSuccess, userId]);

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
                        onClick={handleStatusToggle}
                        disabled={isActionLoading}
                        className={clsx(
                            "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                            actionColor,
                            active && actionBg,
                            isActionLoading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                      {isActionLoading ? (
                          <GhostSpinner className="size-4" />
                      ) : (
                          <ActionIcon className="size-5" />
                      )}
                      <span>
                        {isActionLoading 
                            ? `${isActive ? "Suspending" : "Activating"}...` 
                            : actionLabel
                        }
                      </span>
                    </button>
                )}
              </MenuItem>
            </Transition>
          </Menu>
        </div>

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
