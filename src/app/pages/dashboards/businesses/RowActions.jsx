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
  EyeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  PauseCircleIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";

import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button } from "components/ui";
import {fetchBusinesses, updateBusinessStatus, canShowStatusActions} from "store/slices/businessSlice";
import BusinessDetailsModal from "./extended/BusinessDetailsModal.jsx";
import CorrectionModal from "./extended/CorrectionModal.jsx";

export function RowActions({ row }) {
  const dispatch = useDispatch();

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionError, setActionError] = useState(false);

  // Modal state for business details
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  // Modal state for corrections
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);

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
      const id = row.original.business_id;
      const currentStatus = row.original.status;
      const newStatus = currentStatus === "active" ? "suspended" : "active";

      await dispatch(updateBusinessStatus({ business_id: id, status: newStatus })).unwrap();
      setActionSuccess(true);
    } catch (error) {
      console.log(error);
      setActionError(true);
    } finally {
      setConfirmLoading(false);
    }
  }, [dispatch, row]);

  // Check if suspend/activate actions should be shown
  const canShowActions = canShowStatusActions(row.original);

  const state = actionError ? "error" : actionSuccess ? "success" : "pending";
  const isActive = row.original.status === "active";
  const actionLabel = isActive ? "Suspend" : "Activate";
  const ActionIcon = isActive ? PauseCircleIcon : PlayCircleIcon;
  const actionColor = isActive ? "text-error dark:text-error-light" : "text-success dark:text-success-light";
  const actionBg = isActive ? "bg-error/10 dark:bg-error-light/10" : "bg-success/10 dark:bg-success-light/10";
  
  // Check if business can be sent for corrections (declined status)
  const canSendForCorrection = row.original.verification_status === 'declined';

  const handleCorrectionSuccess = () => {
    dispatch(fetchBusinesses());
  };

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
                        onClick={() => setDetailsModalOpen(true)}
                        className={clsx(
                            "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                            active &&
                            "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                        )}
                    >
                      <EyeIcon className="size-4.5 stroke-1" />
                      <span>View</span>
                    </button>
                )}
              </MenuItem>

              {/* Send for Correction - Only show for declined businesses */}
              {canSendForCorrection && (
                <MenuItem>
                  {({ active }) => (
                      <button
                          onClick={() => setCorrectionModalOpen(true)}
                          className={clsx(
                              "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors text-warning dark:text-warning-light",
                              active && "bg-warning/10 dark:bg-warning-light/10"
                          )}
                      >
                        <ExclamationTriangleIcon className="size-5" />
                        <span>Send for Corrections</span>
                      </button>
                  )}
                </MenuItem>
              )}

              {/* Status Action - Only show if actions are allowed */}
              {canShowActions && (
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
              )}
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
                title: `${actionLabel} Business`,
                description: `Are you sure you want to ${actionLabel.toLowerCase()} this business?`,
                actionText: actionLabel,
              },
              success: {
                title: `Business ${isActive ? "Suspended" : "Activated"}`,
                description: `The business has been successfully ${isActive ? "suspended" : "activated"}.`,
                actionText: "Done",
              },
              error: {
                title: "Operation Failed",
                description:
                    "Something went wrong while updating the status. Please try again.",
                actionText: "Retry",
              },
            }}
        />

        {/* Business Details Modal */}
        {detailsModalOpen && (
            <BusinessDetailsModal
                onClose={() => setDetailsModalOpen(false)}
                businessData={row.original}
                open={detailsModalOpen}
                onReload={() => dispatch(fetchBusinesses())}
            />
        )}

        {/* Correction Modal */}
        <CorrectionModal
            open={correctionModalOpen}
            onClose={() => setCorrectionModalOpen(false)}
            businessData={row.original}
            onSuccess={handleCorrectionSuccess}
        />
      </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object.isRequired,
};
