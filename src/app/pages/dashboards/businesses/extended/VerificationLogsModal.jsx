import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { 
    XMarkIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    CalendarIcon,
    BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { Fragment, useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Button, Badge, GhostSpinner } from "components/ui";
import { fetchVerificationLogs } from "store/slices/businessSlice";
import dayjs from "dayjs";

export function VerificationLogsModal({ open, onClose, business }) {
    const dispatch = useDispatch();
    const closeButtonRef = useRef(null);
    
    const [loading, setLoading] = useState(false);
    const [verificationLogs, setVerificationLogs] = useState([]);
    const [error, setError] = useState("");

    const fetchLogs = useCallback(async () => {
        if (!business?.business_id) return;
        
        setLoading(true);
        setError("");
        try {
            const result = await dispatch(fetchVerificationLogs({ businessId: business.business_id })).unwrap();
            
            if (result.success) {
                setVerificationLogs(result.data);
            } else {
                setError(result.message || "Failed to fetch verification logs");
            }
        } catch (err) {
            setError(err.message || "Failed to fetch verification logs");
        } finally {
            setLoading(false);
        }
    }, [dispatch, business?.business_id]);

    useEffect(() => {
        if (open && business?.business_id) {
            fetchLogs();
        }
    }, [open, business?.business_id, fetchLogs]);

    const handleClose = () => {
        setVerificationLogs([]);
        setError("");
        onClose();
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'verified':
                return <CheckCircleIcon className="size-5 text-success" />;
            case 'declined':
                return <XCircleIcon className="size-5 text-error" />;
            case 'sent_for_corrections':
                return <ExclamationTriangleIcon className="size-5 text-warning" />;
            default:
                return <ClockIcon className="size-5 text-gray-400" />;
        }
    };

    const getActionBadge = (action) => {
        const actionConfig = {
            verified: { color: 'success', label: 'Verified' },
            declined: { color: 'error', label: 'Declined' },
            sent_for_corrections: { color: 'warning', label: 'Sent for Corrections' },
        };
        
        const config = actionConfig[action] || { color: 'neutral', label: action };
        return (
            <Badge color={config.color} className="rounded-full">
                {config.label}
            </Badge>
        );
    };

    return (
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
                        {/* Header */}
                        <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-6 py-4 dark:bg-dark-800">
                            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                                Verification History
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

                        {/* Business Header */}
                        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 px-6 py-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="size-16 rounded-full border-4 border-white dark:border-dark-700 shadow-lg bg-white dark:bg-dark-700 flex items-center justify-center">
                                        <BuildingOfficeIcon className="size-8 text-primary-600 dark:text-primary-400" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-100">
                                        {business?.business_name}
                                    </h2>
                                    <p className="text-gray-600 dark:text-dark-300">
                                        Verification history and admin actions
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <GhostSpinner className="size-8" />
                                    <span className="ml-3 text-gray-600 dark:text-dark-300">Loading verification logs...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <div className="text-error dark:text-error-light mb-4">{error}</div>
                                    <Button onClick={fetchLogs} size="sm">
                                        Try Again
                                    </Button>
                                </div>
                            ) : verificationLogs.length > 0 ? (
                                <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                    <div className="flex items-center mb-6">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                                            <DocumentTextIcon className="size-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                            Verification Timeline
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {verificationLogs.map((log, index) => (
                                            <div key={log.id} className="relative">
                                                {/* Timeline line */}
                                                {index < verificationLogs.length - 1 && (
                                                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-dark-600"></div>
                                                )}
                                                
                                                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-dark-600 rounded-lg">
                                                    <div className="flex-shrink-0 mt-1 relative z-10 bg-gray-50 dark:bg-dark-600 p-1">
                                                        {getActionIcon(log.action)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center space-x-3">
                                                                {getActionBadge(log.action)}
                                                                <span className="text-sm text-gray-600 dark:text-dark-300">
                                                                    by {log.admin_email}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500 dark:text-dark-400">
                                                                <CalendarIcon className="size-4 mr-1" />
                                                                {dayjs(log.created_at).format('MMM DD, YYYY HH:mm')}
                                                            </div>
                                                        </div>
                                                        {log.comments && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">Comments:</p>
                                                                <p className="text-sm text-gray-600 dark:text-dark-300 bg-white dark:bg-dark-700 p-3 rounded border">
                                                                    {log.comments}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <DocumentTextIcon className="size-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-dark-400">No verification logs found for this business.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="space-x-3 flex justify-end rounded-b-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <Button
                                onClick={handleClose}
                                variant="outlined"
                                className="min-w-[7rem]"
                            >
                                Close
                            </Button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

VerificationLogsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    business: PropTypes.object,
};
