import { useState, useEffect, useRef, Fragment, useCallback } from "react";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import {
    XMarkIcon,
    LinkIcon,
    BuildingOfficeIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Input, Button, GhostSpinner, Badge, Spinner } from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import API from "utils/api";
import { toast } from "sonner";

// Business levels will be fetched from API

const echoCodeSchema = yup.object().shape({
    ecosystemName: yup.string().required("Ecosystem name is required"),
    currentBusinessLevel: yup.string().required("Current business level is required"),
    partnerBusinessLevel: yup
        .string()
        .required("Partner business level is required")
        .test('different-levels', 'Business levels must be different', function(value) {
            const { currentBusinessLevel } = this.parent;
            return currentBusinessLevel && value && currentBusinessLevel !== value;
        }),
    loanPaymentCycleDays: yup
        .number()
        .positive("Must be a positive number")
        .integer("Must be a whole number")
        .required("Loan payment cycle is required"),
    interestRate: yup
        .number()
        .min(0, "Interest rate cannot be negative")
        .max(100, "Interest rate cannot exceed 100%")
        .required("Interest rate is required"),
});

export default function EchoCodeModal({ open, onClose, currentBusiness }) {
    const closeButtonRef = useRef(null);
    const searchRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [generatedEchoCode, setGeneratedEchoCode] = useState("");
    const [businessLevels, setBusinessLevels] = useState([]);
    const [loadingLevels, setLoadingLevels] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(echoCodeSchema),
        defaultValues: {
            ecosystemName: "",
            currentBusinessLevel: "",
            partnerBusinessLevel: "",
            loanPaymentCycleDays: 30,
            interestRate: 5.0,
        },
    });

    const watchedValues = watch();

    // Fetch business levels from API
    const fetchBusinessLevels = useCallback(async () => {
        setLoadingLevels(true);
        try {
            const response = await API.get("/ecosystems/business-levels");
            if (response.data.success) {
                setBusinessLevels(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to fetch business levels");
            }
        } catch (error) {
            console.error("Error fetching business levels:", error);
            toast.error("Failed to fetch business levels");
        } finally {
            setLoadingLevels(false);
        }
    }, []);

    // Fetch business levels when modal opens
    useEffect(() => {
        if (open) {
            fetchBusinessLevels();
        }
    }, [open, fetchBusinessLevels]);

    // Generate ecosystem name based on selected businesses and levels
    useEffect(() => {
        if (
            currentBusiness &&
            selectedBusiness &&
            watchedValues.currentBusinessLevel &&
            watchedValues.partnerBusinessLevel
        ) {
            const ecosystemName = `${currentBusiness.business_name} (${watchedValues.currentBusinessLevel}) - ${selectedBusiness.business_name} (${watchedValues.partnerBusinessLevel})`;
            setValue("ecosystemName", ecosystemName);
        } else {
            // Reset ecosystem name if any required field is missing
            setValue("ecosystemName", "");
        }
    }, [
        currentBusiness,
        selectedBusiness,
        watchedValues.currentBusinessLevel,
        watchedValues.partnerBusinessLevel,
        setValue,
    ]);

    // Search businesses for partner selection
    const searchBusinesses = useCallback(async () => {
        if (!searchTerm.trim() || searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        setSearchError("");
        try {
            const response = await API.post("/ecosystems/search-businesses", {
                search: searchTerm.trim(),
                exclude_business_id: currentBusiness?.business_id,
            });
            
            if (response.data.success) {
                setSearchResults(response.data.data);
            } else {
                setSearchError(response.data.message || "Search failed");
            }
        } catch (error) {
            console.error("Error searching businesses:", error);
            setSearchError("Failed to search businesses");
        } finally {
            setSearchLoading(false);
        }
    }, [searchTerm, currentBusiness]);

    // Debounced search effect
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchTerm.length >= 2) {
                searchBusinesses();
            } else {
                setSearchResults([]);
                setSearchError("");
            }
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm, searchBusinesses]);

    const onSubmit = async (data) => {
        if (!selectedBusiness) {
            toast.error("Please select a partner business");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ecosystem_name: data.ecosystemName,
                business_a_id: currentBusiness.business_id,
                business_a_level: data.currentBusinessLevel,
                business_b_id: selectedBusiness.business_id,
                business_b_level: data.partnerBusinessLevel,
                loan_payment_cycle_days: data.loanPaymentCycleDays,
                interest_rate: data.interestRate,
            };

            const response = await API.post("/ecosystems", payload);
            if (response.data.success) {
                setGeneratedEchoCode(response.data.data.echo_code);
                toast.success("Echo code created successfully!");
                reset();
            } else {
                toast.error(response.data.message || "Failed to create echo code");
            }
        } catch (error) {
            console.error("Error creating echo code:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to create echo code";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        setSearchTerm("");
        setSearchResults([]);
        setSearchError("");
        setSelectedBusiness(null);
        setGeneratedEchoCode("");
        setBusinessLevels([]);
        onClose();
    };

    // Validate that business levels are different
    const validateDifferentLevels = () => {
        const currentLevel = watchedValues.currentBusinessLevel;
        const partnerLevel = watchedValues.partnerBusinessLevel;
            
        return currentLevel && partnerLevel && currentLevel !== partnerLevel;
    };

    const getStatusBadge = (statusTag) => {
        const configs = {
            available: {
                text: "Available",
                className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            },
            linked: {
                text: "Already Linked",
                className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            },
            pending: {
                text: "Pending Invitation",
                className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }
        };

        const config = configs[statusTag] || configs.available;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                {config.text}
            </span>
        );
    };

    const handleSelectBusiness = (business) => {
        if (business.status_tag === 'linked') {
            toast.info('This business is already linked with an echo code.');
            return;
        }
        setSelectedBusiness(business);
        // Reset ecosystem name when business selection changes
        setValue("ecosystemName", "");
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
                        <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <DialogTitle className="flex items-center gap-3 text-base font-medium text-gray-800 dark:text-dark-100">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                                    <LinkIcon className="size-4 text-green-600 dark:text-green-400" />
                                </div>
                                Add Echo Code
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
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 dark:text-dark-300">
                                    Create a new business ecosystem by linking{" "}
                                    <span className="font-medium text-gray-700 dark:text-dark-100">
                                        {currentBusiness?.business_name}
                                    </span>{" "}
                                    with another business.
                                </p>
                            </div>

                            {generatedEchoCode ? (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <CheckCircleIcon className="size-8 text-green-400" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                                                Echo Code Generated Successfully!
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                                                    Your business ecosystem has been created with the following details:
                                                </p>
                                                <div className="bg-white dark:bg-dark-700 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-dark-200">Echo Code:</span>
                                                        <Badge color="success" size="lg" className="font-mono">
                                                            {generatedEchoCode}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Business Level Assignment */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                                                <BuildingOfficeIcon className="size-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Business Level Assignment
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Controller
                                                name="currentBusinessLevel"
                                                control={control}
                                                render={({ field }) => {
                                                    // Find the matching business level object
                                                    const selectedLevel = businessLevels.find(level => level.level === field.value);
                                                    
                                                    return (
                                                        <Combobox
                                                            data={businessLevels}
                                                            displayField="level"
                                                            valueField="level"
                                                            value={selectedLevel}
                                                            onChange={(value) => {
                                                                // Extract level string from object if needed
                                                                const levelValue = typeof value === 'object' 
                                                                    ? value?.level 
                                                                    : value;
                                                                field.onChange(levelValue);
                                                            }}
                                                            placeholder="Select business level"
                                                            label={`Business Level for ${currentBusiness?.business_name}`}
                                                            searchFields={["level", "description"]}
                                                            error={errors.currentBusinessLevel?.message}
                                                            required
                                                            loading={loadingLevels}
                                                            icon={<BuildingOfficeIcon className="size-4" />}
                                                        />
                                                    );
                                                }}
                                            />

                                            <Controller
                                                name="partnerBusinessLevel"
                                                control={control}
                                                render={({ field }) => {
                                                    // Find the matching business level object
                                                    const selectedLevel = businessLevels.find(level => level.level === field.value);
                                                    
                                                    return (
                                                        <Combobox
                                                            data={businessLevels}
                                                            displayField="level"
                                                            valueField="level"
                                                            value={selectedLevel}
                                                            onChange={(value) => {
                                                                // Extract level string from object if needed
                                                                const levelValue = typeof value === 'object' 
                                                                    ? value?.level 
                                                                    : value;
                                                                field.onChange(levelValue);
                                                            }}
                                                            placeholder="Select partner business level"
                                                            label="Partner Business Level"
                                                            searchFields={["level", "description"]}
                                                            error={
                                                                errors.partnerBusinessLevel?.message ||
                                                                (!validateDifferentLevels() &&
                                                                    watchedValues.currentBusinessLevel &&
                                                                    watchedValues.partnerBusinessLevel
                                                                    ? "Business levels must be different"
                                                                    : "")
                                                            }
                                                            required
                                                            loading={loadingLevels}
                                                            icon={<BuildingOfficeIcon className="size-4" />}
                                                        />
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Partner Selection */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3">
                                                <BuildingOfficeIcon className="size-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Partner Business Selection
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {/* Search Input */}
                                            <Input
                                                ref={searchRef}
                                                label="Search Partner Business"
                                                placeholder="Search by business name..."
                                                prefix={<MagnifyingGlassIcon className="size-5" />}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />

                                            {/* Selected Business Display */}
                                            {selectedBusiness && (
                                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-medium text-green-800 dark:text-green-200">
                                                                Selected Partner: {selectedBusiness.business_name}
                                                            </h4>
                                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                                {selectedBusiness.business_email}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outlined"
                                                            onClick={() => {
                                                                setSelectedBusiness(null);
                                                                setValue("ecosystemName", "");
                                                            }}
                                                            className="text-green-600 border-green-300 hover:bg-green-100 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20"
                                                        >
                                                            Change
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Search Results */}
                                            <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
                                                {searchLoading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Spinner color="primary" />
                                                        <span className="ml-2 text-sm text-gray-500 dark:text-dark-200">
                                                            Searching...
                                                        </span>
                                                    </div>
                                                ) : searchError ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="text-center">
                                                            <p className="text-red-600 dark:text-red-400 text-sm">
                                                                {searchError}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : searchResults.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {searchResults.map((business) => (
                                                            <div
                                                                key={business.business_id}
                                                                className={`flex items-center justify-between rounded-lg border p-4 ${
                                                                    business.status_tag === 'linked' 
                                                                        ? 'border-gray-200 bg-gray-50 dark:border-dark-600 dark:bg-dark-800 opacity-60' 
                                                                        : 'border-gray-200 bg-white dark:border-dark-600 dark:bg-dark-700'
                                                                }`}
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <div>
                                                                            <h4 className="font-medium text-gray-900 dark:text-dark-50">
                                                                                {business.business_name}
                                                                            </h4>
                                                                            <p className="text-sm text-gray-500 dark:text-dark-200">
                                                                                {business.business_email}
                                                                            </p>
                                                                            <p className="text-xs text-gray-400 dark:text-dark-300">
                                                                                {business.business_type_name || business.business_type} • {business.verification_status}
                                                                            </p>
                                                                        </div>
                                                                        <div className="ml-auto">
                                                                            {getStatusBadge(business.status_tag)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleSelectBusiness(business)}
                                                                        disabled={business.status_tag === 'linked'}
                                                                        color={business.status_tag === 'available' ? 'primary' : 'neutral'}
                                                                        className="rounded-full"
                                                                    >
                                                                        {business.status_tag === 'available' ? 'Select' : 'Unavailable'}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : searchTerm.length >= 2 ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-500 dark:text-dark-200 mb-4">
                                                                No businesses found matching &ldquo;{searchTerm}&rdquo;
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-dark-300">
                                                                Try searching with a different term
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center py-8">
                                                        <p className="text-sm text-gray-500 dark:text-dark-200">
                                                            Enter at least 2 characters to search for businesses
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ecosystem Details */}
                                    <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                        <div className="flex items-center mb-6">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                                                <LinkIcon className="size-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                Ecosystem Details
                                            </h3>
                                        </div>
                                        <div className="space-y-6">
                                            <Input
                                                {...register("ecosystemName")}
                                                label="Ecosystem Name"
                                                placeholder="Will be generated automatically"
                                                error={errors.ecosystemName?.message}
                                                required
                                                readOnly
                                                className="bg-gray-50 dark:bg-dark-600"
                                            />

                                            <div className="grid gap-4 lg:grid-cols-2">
                                                <Input
                                                    {...register("loanPaymentCycleDays", {
                                                        valueAsNumber: true,
                                                    })}
                                                    type="number"
                                                    label="Loan Payment Cycle (Days)"
                                                    placeholder="Enter number of days"
                                                    prefix={<CalendarDaysIcon className="size-4 text-gray-400" />}
                                                    error={errors.loanPaymentCycleDays?.message}
                                                    required
                                                />
                                                <Input
                                                    {...register("interestRate", {
                                                        valueAsNumber: true,
                                                    })}
                                                    type="number"
                                                    step="0.01"
                                                    label="Interest Rate (%)"
                                                    placeholder="Enter interest rate"
                                                    prefix={<CurrencyDollarIcon className="size-4 text-gray-400" />}
                                                    error={errors.interestRate?.message}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="space-x-3 flex justify-end rounded-b-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            {generatedEchoCode ? (
                                <Button onClick={handleClose} color="primary" className="min-w-[7rem]">
                                    Done
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={handleClose}
                                        disabled={loading}
                                        className="min-w-[7rem]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={loading || !validateDifferentLevels() || !selectedBusiness}
                                        className="min-w-[8rem]"
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <GhostSpinner className="size-4 border-2" />
                                                <span>Creating...</span>
                                            </div>
                                        ) : (
                                            "Create Echo Code"
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

EchoCodeModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    currentBusiness: PropTypes.object,
};
