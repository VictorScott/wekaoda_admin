import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { 
    XMarkIcon,
    EnvelopeIcon,
    BriefcaseIcon,
    CalendarIcon,
    IdentificationIcon,
    ClockIcon,
    DocumentTextIcon,
    UserGroupIcon,
    BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { Fragment, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {Button, Badge} from "components/ui";
import dayjs from "dayjs";

export default function PartnershipDetailsModal({ open, onClose, ecosystemData, businessData }) {
    const closeButtonRef = useRef(null);
    
    const [ecosystemDetails, setEcosystemDetails] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open && ecosystemData && businessData) {
            // Determine which business is the current one and which is the partner
            const currentBusinessId = businessData.business_id;
            const isCurrentBusinessA = ecosystemData.business_a?.business_id === currentBusinessId;
            
            const processedData = {
                ...ecosystemData,
                current_business: isCurrentBusinessA ? ecosystemData.business_a : ecosystemData.business_b,
                partner_business: isCurrentBusinessA ? ecosystemData.business_b : ecosystemData.business_a,
                current_business_level: isCurrentBusinessA ? ecosystemData.business_a?.business_level : ecosystemData.business_b?.business_level,
                partner_business_level: isCurrentBusinessA ? ecosystemData.business_b?.business_level : ecosystemData.business_a?.business_level,
            };
            
            setEcosystemDetails(processedData);
        }
    }, [open, ecosystemData, businessData]);

    const handleClose = () => {
        setEcosystemDetails(null);
        setError("");
        onClose();
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'success', label: 'Active' },
            suspended: { color: 'error', label: 'Suspended' },
            inactive: { color: 'neutral', label: 'Inactive' },
            pending: { color: 'warning', label: 'Pending' }
        };
        
        const config = statusConfig[status] || { color: 'neutral', label: status || 'Unknown' };
        return (
            <Badge color={config.color} size="sm">
                {config.label}
            </Badge>
        );
    };

    const InfoItem = ({ label, value, icon: Icon }) => (
        <div className="flex items-start">
            {Icon && <Icon className="size-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-dark-200">{label}</p>
                <p className="text-gray-900 dark:text-dark-100 mt-1">
                    {value || <span className="text-gray-500 dark:text-dark-300 italic">Not provided</span>}
                </p>
            </div>
        </div>
    );

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
                        <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <DialogTitle className="text-base font-medium text-gray-800 dark:text-dark-100">
                                Ecosystem Details
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
                            {error ? (
                                <div className="text-center py-8">
                                    <div className="text-error dark:text-error-light mb-4">{error}</div>
                                    <Button onClick={() => setEcosystemDetails(ecosystemData)} size="sm">
                                        Try Again
                                    </Button>
                                </div>
                            ) : ecosystemDetails ? (
                                <div className="space-y-8">
                                    {/* Ecosystem Header */}
                                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-6">
                                        <div className="flex items-start space-x-6">
                                            <div className="flex-shrink-0">
                                                <div className="size-20 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center border-4 border-white dark:border-dark-700 shadow-lg">
                                                    <UserGroupIcon className="size-10 text-primary-600 dark:text-primary-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                                                            {ecosystemDetails.ecosystem_name}
                                                        </h2>
                                                        <div className="flex items-center mt-2 text-gray-600 dark:text-dark-300">
                                                            <IdentificationIcon className="size-5 mr-2" />
                                                            <span>Eco Code: {ecosystemDetails.eco_code}</span>
                                                        </div>
                                                        <div className="flex items-center mt-2 text-gray-600 dark:text-dark-300">
                                                            <CalendarIcon className="size-5 mr-2" />
                                                            <span>Established: {dayjs(ecosystemDetails.created_at).format('MMM DD, YYYY')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-2">
                                                        {getStatusBadge(ecosystemDetails.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ecosystem Information */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg mr-3">
                                                <UserGroupIcon className="size-6 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Ecosystem Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem 
                                                label="Eco Code" 
                                                value={ecosystemDetails.eco_code}
                                                icon={IdentificationIcon}
                                            />
                                            <InfoItem 
                                                label="Ecosystem Name" 
                                                value={ecosystemDetails.ecosystem_name}
                                                icon={UserGroupIcon}
                                            />
                                            <InfoItem 
                                                label="Credit Period" 
                                                value={`${ecosystemDetails.loan_payment_cycle_days} days`}
                                                icon={ClockIcon}
                                            />
                                            <InfoItem 
                                                label="Interest Rate" 
                                                value={`${ecosystemDetails.interest_rate}%`}
                                                icon={DocumentTextIcon}
                                            />
                                            <InfoItem 
                                                label="Established" 
                                                value={dayjs(ecosystemDetails.created_at).format('MMM DD, YYYY HH:mm')}
                                                icon={CalendarIcon}
                                            />
                                            <InfoItem 
                                                label="Last Updated" 
                                                value={dayjs(ecosystemDetails.updated_at).format('MMM DD, YYYY HH:mm')}
                                                icon={ClockIcon}
                                            />
                                            <div className="flex items-start">
                                                <UserGroupIcon className="size-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Current Status</p>
                                                    <div className="mt-1">
                                                        {getStatusBadge(ecosystemDetails.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Information Cards */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Primary Business */}
                                        <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                            <div className="flex items-center mb-6">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                                                    <BuildingOfficeIcon className="size-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                    {businessData.business_name}
                                                </h3>
                                            </div>
                                            <div className="space-y-4">
                                                <InfoItem 
                                                    label="Business Name" 
                                                    value={ecosystemDetails.current_business?.business_name}
                                                    icon={BriefcaseIcon}
                                                />
                                                <InfoItem 
                                                    label="Email" 
                                                    value={ecosystemDetails.current_business?.business_email}
                                                    icon={EnvelopeIcon}
                                                />
                                                <InfoItem 
                                                    label="Business Level" 
                                                    value={ecosystemDetails.current_business_level}
                                                    icon={IdentificationIcon}
                                                />
                                                <InfoItem 
                                                    label="Registration Number" 
                                                    value={ecosystemDetails.current_business?.registration_number}
                                                    icon={DocumentTextIcon}
                                                />
                                            </div>
                                        </div>

                                        {/* Partner Business */}
                                        <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                            <div className="flex items-center mb-6">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                                                    <BuildingOfficeIcon className="size-6 text-green-600 dark:text-green-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                    {ecosystemDetails.partner_business?.business_name}
                                                </h3>
                                            </div>
                                            <div className="space-y-4">
                                                <InfoItem 
                                                    label="Business Name" 
                                                    value={ecosystemDetails.partner_business?.business_name}
                                                    icon={BriefcaseIcon}
                                                />
                                                <InfoItem 
                                                    label="Email" 
                                                    value={ecosystemDetails.partner_business?.business_email}
                                                    icon={EnvelopeIcon}
                                                />
                                                <InfoItem 
                                                    label="Business Level" 
                                                    value={ecosystemDetails.partner_business_level}
                                                    icon={IdentificationIcon}
                                                />
                                                <InfoItem 
                                                    label="Registration Number" 
                                                    value={ecosystemDetails.partner_business?.registration_number}
                                                    icon={DocumentTextIcon}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ecosystem Notes */}
                                    {ecosystemDetails.notes && (
                                        <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                            <div className="flex items-center mb-6">
                                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg mr-3">
                                                    <DocumentTextIcon className="size-6 text-yellow-600 dark:text-yellow-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                    Ecosystem Notes
                                                </h3>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-dark-600 rounded-lg p-4">
                                                <p className="text-gray-900 dark:text-dark-100 text-sm whitespace-pre-wrap">
                                                    {ecosystemDetails.notes}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

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

PartnershipDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    ecosystemData: PropTypes.object,
    businessData: PropTypes.object,
};
