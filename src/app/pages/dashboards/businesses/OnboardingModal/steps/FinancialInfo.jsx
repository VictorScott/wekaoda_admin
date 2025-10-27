import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    CurrencyDollarIcon,
    IdentificationIcon,
    BanknotesIcon,
    BriefcaseIcon,
} from "@heroicons/react/24/outline";
import {Input, Button, GhostSpinner} from "components/ui";
import { financialInfoSchema } from "../schema";
import { useOnboardingFormContext } from "../OnboardingFormContext";
import { useDispatch } from "react-redux";
import { saveDraft } from "store/slices/businessSlice";
import { toast } from "sonner";

export function FinancialInfo({ setCurrentStep, onDraftSaved }) {
    const { state, dispatch, refetchFormData } = useOnboardingFormContext();
    const reduxDispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(financialInfoSchema),
        defaultValues: state.formData.financialInfo || {
            source_of_wealth: "",
            source_of_funds: "",
            expected_annual_turnover: "",
            tinNumber: "",
        },
    });

    useEffect(() => {
        if (state.formData.financialInfo) {
            reset(state.formData.financialInfo);
        }
    }, [state.formData.financialInfo, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMsg("");

        try {
            // Save draft to backend
            const result = await reduxDispatch(saveDraft({
                businessId: state.businessId,
                step: 'financialInfo',
                data: data
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
                    payload: { financialInfo: data }
                });

                // Mark step as completed
                dispatch({
                    type: "SET_STEP_STATUS",
                    payload: { financialInfo: { isDone: true } }
                });

                toast.success("Financial information saved as draft");
                
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
                setErrorMsg(result.message || "Failed to save financial information");
            }
        } catch (error) {
            console.error("Error saving financial information:", error);
            setErrorMsg(error.message || "Failed to save financial information");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-6">
            <Input
                {...register("source_of_wealth")}
                label="Source of Wealth"
                placeholder="e.g. Business revenue, salary, investments"
                prefix={<BriefcaseIcon className="w-5 h-5 text-gray-400" />}
                error={errors?.source_of_wealth?.message}
            />

            <Input
                {...register("source_of_funds")}
                label="Source of Funds"
                placeholder="e.g. Loan, personal savings"
                prefix={<BanknotesIcon className="w-5 h-5 text-gray-400" />}
                error={errors?.source_of_funds?.message}
            />

            <Input
                {...register("expected_annual_turnover")}
                type="number"
                label="Expected Annual Turnover (in USD)"
                placeholder="e.g. 100000"
                prefix={<CurrencyDollarIcon className="w-5 h-5 text-gray-400" />}
                error={errors?.expected_annual_turnover?.message}
            />

            <Input
                {...register("tinNumber")}
                label="TIN Number"
                placeholder="Enter Tax Identification Number"
                prefix={<IdentificationIcon className="w-5 h-5 text-gray-400" />}
                error={errors?.tinNumber?.message}
            />

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

FinancialInfo.propTypes = {
    setCurrentStep: PropTypes.func.isRequired,
    onDraftSaved: PropTypes.func,
};
