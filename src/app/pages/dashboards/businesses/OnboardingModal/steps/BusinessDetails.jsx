 import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    IdentificationIcon,
    BriefcaseIcon,
    CalendarDaysIcon,
    BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import {Input, Button, GhostSpinner, Spinner} from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import { DatePicker } from "components/shared/form/Datepicker";
import { CountrySelect } from "../components/CountrySelect";
import { useOnboardingFormContext } from "../OnboardingFormContext";
import { useDispatch } from "react-redux";
import { saveDraft } from "store/slices/businessSlice";
import API from "utils/api";
import { toast } from "sonner";

// Schema for business details validation
const businessDetailsSchema = yup.object().shape({
    businessName: yup.string().required("Business name is required"),
    registrationNumber: yup.string().required("Registration number is required"),
    businessType: yup.mixed().required("Business type is required"),
    businessLevel: yup.mixed().required("Business level is required"),
    natureOfBusiness: yup.string().required("Nature of business is required"),
    countryOfRegistration: yup.string().required("Country of registration is required"),
    dateOfRegistration: yup.date().required("Date of registration is required"),
});

export function BusinessDetails({ setCurrentStep, onDraftSaved }) {
    const { state, dispatch, refetchFormData } = useOnboardingFormContext();
    const reduxDispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [businessTypes, setBusinessTypes] = useState([]);
    const [businessLevels, setBusinessLevels] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Business types that don't require directors step
    const BUSINESS_TYPES_WITHOUT_DIRECTORS = ['sole_proprietorship'];

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isValid },
    } = useForm({
        resolver: yupResolver(businessDetailsSchema),
        mode: "onChange",
        defaultValues: state.formData.businessDetails || {},
    });

    // Fetch business types and levels
    useEffect(() => {
        const fetchBusinessData = async () => {
            try {
                // Fetch business types
                const typesResponse = await API.get("/auth/business-types");
                if (typesResponse.data.success) {
                    setBusinessTypes(typesResponse.data.data);
                }

                // Fetch business levels
                const levelsResponse = await API.get("/auth/business-levels");
                if (levelsResponse.data.success) {
                    setBusinessLevels(levelsResponse.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch business data:", error);
                toast.error("Failed to load business data");
            } finally {
                setLoadingData(false);
            }
        };

        fetchBusinessData();
    }, []);

    useEffect(() => {
        if (state.formData.businessDetails && businessTypes.length > 0 && businessLevels.length > 0) {
            const formData = { ...state.formData.businessDetails };
            
            // Map business type string to object
            if (formData.businessType && typeof formData.businessType === 'string') {
                const businessTypeObj = businessTypes.find(bt => 
                    bt.type === formData.businessType || bt.name === formData.businessType
                );
                if (businessTypeObj) {
                    formData.businessType = businessTypeObj;
                }
            }
            
            // Map business level string to object
            if (formData.businessLevel && typeof formData.businessLevel === 'string') {
                const businessLevelObj = businessLevels.find(bl => 
                    bl.level === formData.businessLevel || bl.alias === formData.businessLevel
                );
                if (businessLevelObj) {
                    formData.businessLevel = businessLevelObj;
                }
            }
            
            reset(formData);
        }
    }, [state.formData.businessDetails, businessTypes, businessLevels, reset]);

    // Update step status
    useEffect(() => {
        dispatch({
            type: "SET_STEP_STATUS",
            payload: { businessDetails: { isDone: isValid } }
        });
    }, [isValid, dispatch]);

    // Handle business type change
    const handleBusinessTypeChange = (newBusinessType) => {
        const currentBusinessType = state.formData.businessDetails?.businessType;
        
        // Only proceed if business type actually changed
        if (currentBusinessType !== newBusinessType) {
            // Update local state immediately with new business type
            dispatch({
                type: "SET_FORM_DATA",
                payload: { 
                    businessDetails: {
                        ...state.formData.businessDetails,
                        businessType: newBusinessType
                    },
                    meta: { 
                        ...state.formData.meta,
                        business_type: newBusinessType?.type || newBusinessType
                    }
                }
            });

            // Reset directors step status if switching between types that require/don't require directors
            const currentRequiresDirectors = !BUSINESS_TYPES_WITHOUT_DIRECTORS.includes(currentBusinessType?.type || currentBusinessType);
            const newRequiresDirectors = !BUSINESS_TYPES_WITHOUT_DIRECTORS.includes(newBusinessType?.type || newBusinessType);
            
            if (currentRequiresDirectors !== newRequiresDirectors) {
                // Reset directors step status
                dispatch({
                    type: "SET_STEP_STATUS",
                    payload: { 
                        directors: { isDone: false }
                    }
                });

                // If new type doesn't require directors, mark it as done
                if (!newRequiresDirectors) {
                    dispatch({
                        type: "SET_STEP_STATUS",
                        payload: { 
                            directors: { isDone: true }
                        }
                    });
                }
            }

            // Reset KYC documents step since required documents may change
            dispatch({
                type: "SET_STEP_STATUS",
                payload: { 
                    kycDocuments: { isDone: false }
                }
            });

            // Clear existing KYC documents data since requirements may have changed
            dispatch({
                type: "SET_FORM_DATA",
                payload: { 
                    kycDocuments: { docs: [] }
                }
            });

            // If changing to sole proprietorship, clear directors data
            const newType = newBusinessType?.type || newBusinessType;
            if (newType === 'sole_proprietorship') {
                dispatch({
                    type: "SET_FORM_DATA",
                    payload: { 
                        directors_names: []
                    }
                });
            }

            // Show feedback message
            const businessTypeObj = businessTypes.find(bt => bt.type === newType);
            if (businessTypeObj) {
                toast.success(`Business type changed to ${businessTypeObj.name}`);
            }
        }
    };

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            // Handle business type change if needed
            if (formData.businessType) {
                handleBusinessTypeChange(formData.businessType);
            }

            // Extract values from objects for backend
            const dataToSend = {
                ...formData,
                businessType: formData.businessType?.type || formData.businessType,
                businessLevel: formData.businessLevel?.level || formData.businessLevel,
            };

            // Save draft to backend
            const result = await reduxDispatch(saveDraft({
                businessId: state.businessId,
                step: 'businessDetails',
                data: dataToSend
            })).unwrap();

            if (result.success) {
                // Update business ID if this is the first save
                if (!state.businessId && result.data.business_id) {
                    dispatch({
                        type: "SET_BUSINESS_ID",
                        payload: result.data.business_id
                    });
                }

                // Update form data in context
                dispatch({
                    type: "SET_FORM_DATA",
                    payload: { businessDetails: formData }
                });

                // Mark step as completed
                dispatch({
                    type: "SET_STEP_STATUS",
                    payload: { businessDetails: { isDone: true } }
                });

                toast.success("Business details saved as draft");
                
                // Refetch form data to get latest values
                if (typeof refetchFormData === "function") {
                    await refetchFormData();
                }
                
                // Trigger table refresh with business ID
                if (onDraftSaved) {
                    onDraftSaved(result.data.business_id);
                }
                
                // Move to next step
                setCurrentStep(prev => prev + 1);
            } else {
                toast.error(result.message || "Failed to save draft");
            }
        } catch (error) {
            console.error("Error saving business details:", error);
            toast.error("Failed to save business details");
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spinner color="primary" />
                <span className="ml-3 text-gray-600 dark:text-dark-300">Loading business data...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Type */}
            <Controller
                control={control}
                name="businessType"
                render={({ field }) => (
                    <Combobox
                        data={businessTypes}
                        displayField="name"
                        valueField="type"
                        value={field.value}
                        onChange={(value) => {
                            field.onChange(value);
                            handleBusinessTypeChange(value);
                        }}
                        placeholder="Select Business Type"
                        label="Business Type"
                        searchFields={["type", "name"]}
                        error={errors.businessType?.message}
                        required
                    />
                )}
            />

            {/* Business Name and Registration Number in 2-column grid */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Input
                    {...register("businessName")}
                    label="Business Name"
                    placeholder="Enter Business Name"
                    prefix={<BuildingOfficeIcon className="h-5 w-5 text-gray-400" />}
                    error={errors.businessName?.message}
                    required
                />
                <Input
                    {...register("registrationNumber")}
                    label="Registration Number"
                    placeholder="Enter Registration Number"
                    prefix={<IdentificationIcon className="h-5 w-5 text-gray-400" />}
                    error={errors.registrationNumber?.message}
                    required
                />
            </div>

            {/* Business Level */}
            <Controller
                control={control}
                name="businessLevel"
                render={({ field }) => (
                    <Combobox
                        data={businessLevels}
                        displayField="level"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Business Level"
                        label="Business Level"
                        searchFields={["level", "alias", "description"]}
                        error={errors.businessLevel?.message}
                        required
                    />
                )}
            />

            {/* Nature of Business */}
            <Input
                {...register("natureOfBusiness")}
                label="Nature of Business"
                placeholder="e.g. Retail, Consulting, Manufacturing"
                prefix={<BriefcaseIcon className="h-5 w-5 text-gray-400" />}
                error={errors.natureOfBusiness?.message}
                required
            />

            {/* Country and Date of Registration in 2-column grid */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Controller
                    name="countryOfRegistration"
                    control={control}
                    render={({ field }) => (
                        <CountrySelect
                            {...field}
                            value={field.value || ""}
                            label="Country of Registration"
                            error={errors?.countryOfRegistration?.message}
                        />
                    )}
                />

                <Controller
                    name="dateOfRegistration"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            label="Date of Registration"
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Select Date"
                            options={{ disableMobile: true }}
                            error={errors?.dateOfRegistration?.message}
                            icon={<CalendarDaysIcon className="h-5 w-5 text-gray-400" />}
                        />
                    )}
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
                <Button
                    type="submit"
                    color="primary"
                    disabled={!isValid || loading}
                    className="min-w-[7rem]"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <GhostSpinner className="size-4 border-2" />
                            <span>Saving...</span>
                        </div>
                    ) : (
                        "Next"
                    )}
                </Button>
            </div>
        </form>
    );
}

BusinessDetails.propTypes = {
    setCurrentStep: PropTypes.func.isRequired,
    onDraftSaved: PropTypes.func,
};
