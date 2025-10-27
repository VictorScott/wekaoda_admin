import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    MapPinIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

import {Input, Button, InputErrorMsg, GhostSpinner} from "components/ui";
import { PhoneDialCode } from "../components/PhoneDialCode";
import { useOnboardingFormContext } from "../OnboardingFormContext";
import { businessAddressSchema } from "../schema";
import { useDispatch } from "react-redux";
import { saveDraft } from "store/slices/businessSlice";
import { toast } from "sonner";

export function BusinessAddress({ setCurrentStep, onDraftSaved, refetchFormData }) {
    const { state, dispatch, refetchFormData: contextRefetchFormData } = useOnboardingFormContext();
    const reduxDispatch = useDispatch();
    
    // Use the refetchFormData from props or context
    const refetch = refetchFormData || contextRefetchFormData;
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(businessAddressSchema),
        defaultValues: state.formData.businessAddress || {},
    });

    useEffect(() => {
        if (state.formData.businessAddress) {
            reset(state.formData.businessAddress);
        }
    }, [state.formData.businessAddress, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMsg("");

        try {
            // Log the data being sent to verify dialCode is included
            console.log('BusinessAddress data being sent:', data);
            
            // Save draft to backend
            const result = await reduxDispatch(saveDraft({
                businessId: state.businessId,
                step: 'businessAddress',
                data: data
            })).unwrap();

            if (result.success) {
                // Update form data in context
                dispatch({
                    type: "SET_FORM_DATA",
                    payload: { businessAddress: data },
                });
                
                // Mark step as completed
                dispatch({
                    type: "SET_STEP_STATUS",
                    payload: { businessAddress: { isDone: true } },
                });

                toast.success("Business address saved as draft");
                
                // Refetch form data to get latest values
                if (typeof refetch === "function") {
                    await refetch();
                }
                
                // Trigger table refresh with business ID
                if (onDraftSaved) {
                    onDraftSaved(result.data.business_id);
                }
                
                setCurrentStep((prev) => prev + 1);
            } else {
                setErrorMsg(result.message || "Failed to save address.");
                toast.error(result.message || "Failed to save address");
            }
        } catch (err) {
            console.error("Error saving address:", err);
            setErrorMsg("An error occurred while saving address.");
            toast.error("Failed to save business address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div className="mt-6 space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                    <Input
                        {...register("registeredOffice")}
                        label="Registered Office"
                        placeholder="Enter Registered Office"
                        prefix={<BuildingOffice2Icon className="size-5" />}
                        error={errors?.registeredOffice?.message}
                    />
                    <Input
                        {...register("registeredOfficeAddress")}
                        label="Registered Office Address"
                        placeholder="Enter Full Address"
                        prefix={<MapPinIcon className="size-5" />}
                        error={errors?.registeredOfficeAddress?.message}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Input
                        {...register("postalAddress")}
                        label="Postal Address"
                        placeholder="Enter Postal Address"
                        prefix={<MapPinIcon className="size-5" />}
                        error={errors?.postalAddress?.message}
                    />
                    <Input
                        {...register("postalCode")}
                        label="Postal Code"
                        placeholder="Enter Postal Code"
                        prefix={<MapPinIcon className="size-5" />}
                        error={errors?.postalCode?.message}
                    />
                </div>

                {/* Phone Dial Code + Phone Number */}
                <div className="flex flex-col">
                    <span>Business Phone Number</span>
                    <div className="mt-1.5 flex -space-x-px">
                        <Controller
                            name="dialCode"
                            control={control}
                            render={({ field }) => (
                                <PhoneDialCode {...field} error={Boolean(errors?.dialCode)} />
                            )}
                        />
                        <Input
                            {...register("phone")}
                            classNames={{
                                root: "flex-1",
                                input:
                                    "hover:z-1 focus:z-1 ltr:rounded-l-none rtl:rounded-r-none",
                            }}
                            error={Boolean(errors?.phone)}
                            placeholder="Phone number"
                        />
                    </div>
                    <InputErrorMsg when={errors?.dialCode || errors?.phone}>
                        {errors?.dialCode?.message ?? errors?.phone?.message}
                    </InputErrorMsg>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Input
                        {...register("businessEmail")}
                        label="Business Email"
                        placeholder="e.g. contact@business.com"
                        prefix={<EnvelopeIcon className="size-5" />}
                        error={errors?.businessEmail?.message}
                    />
                    <Input
                        {...register("websiteUrl")}
                        label={
                            <>
                                Website <span className="text-xs text-gray-400">(Optional)</span>
                            </>
                        }
                        placeholder="https://yourbusiness.com"
                        prefix={<GlobeAltIcon className="size-5" />}
                        error={errors?.websiteUrl?.message}
                    />
                </div>

                <Input
                    {...register("address")}
                    label="Business Address"
                    placeholder="Enter Main Office Address"
                    prefix={<MapPinIcon className="size-5" />}
                    error={errors?.address?.message}
                />
            </div>

            {errorMsg && <div className="mt-2 text-red-600">{errorMsg}</div>}

            <div className="mt-8 flex justify-end space-x-3">
                <Button
                    type="button"
                    className="min-w-[7rem]"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    disabled={loading}
                >
                    Back
                </Button>
                <Button type="submit" className="min-w-[7rem]" color="primary" disabled={loading}>
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

BusinessAddress.propTypes = {
    setCurrentStep: PropTypes.func.isRequired,
    onDraftSaved: PropTypes.func,
};
