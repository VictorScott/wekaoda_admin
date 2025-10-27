import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PlusIcon, TrashIcon, UserIcon, AtSymbolIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { Input, Button, GhostSpinner } from "components/ui";
import { useOnboardingFormContext } from "../OnboardingFormContext";
import { useDispatch } from "react-redux";
import { saveDraft } from "store/slices/businessSlice";
import { toast } from "sonner";
import API from "utils/api";

const adminsSchema = yup.object().shape({
    admins: yup.array().of(
        yup.object().shape({
            firstName: yup.string().required("First name is required"),
            lastName: yup.string().required("Last name is required"),
            middleName: yup.string(),
            email: yup.string().email("Invalid email").required("Email is required"),
        })
    ).min(1, "At least one administrator is required"),
});

export function Admins({ setCurrentStep, onDraftSaved, refetchFormData }) {
    const { state, dispatch, refetchFormData: contextRefetchFormData } = useOnboardingFormContext();
    const reduxDispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Use the refetchFormData from props or context
    const refetch = refetchFormData || contextRefetchFormData;
    const [adminsData, setAdminsData] = useState([{ firstName: "", lastName: "", middleName: "", email: "" }]);

    // Fetch admins data from API
    const fetchAdminsData = useCallback(async () => {
        if (!state.businessId) return;
        
        try {
            const response = await API.post("/onboarding/get-business-admins", {
                business_id: state.businessId
            });
            
            if (response.data.success && response.data.data.length > 0) {
                setAdminsData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching admins data:", error);
        }
    }, [state.businessId]);

    const safeAdmins = useMemo(() => {
        return Array.isArray(adminsData)
            ? adminsData.map((admin) => ({
                firstName: admin?.firstName || "",
                lastName: admin?.lastName || "",
                middleName: admin?.middleName || "",
                email: admin?.email || "",
            }))
            : [{ firstName: "", lastName: "", middleName: "", email: "" }];
    }, [adminsData]);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(adminsSchema),
        mode: "onChange",
        defaultValues: { admins: safeAdmins },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "admins",
    });

    // Fetch admins data on component mount
    useEffect(() => {
        fetchAdminsData();
    }, [fetchAdminsData]);

    // Reset form when admins data changes
    useEffect(() => {
        reset({
            admins: safeAdmins.length > 0 ? safeAdmins : [{ firstName: "", lastName: "", middleName: "", email: "" }],
        });
    }, [safeAdmins, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMsg("");

        try {
            // Save draft to backend
            const result = await reduxDispatch(saveDraft({
                businessId: state.businessId,
                step: 'admins',
                data: data
            })).unwrap();

            if (result.success) {
                // Update local admins data
                setAdminsData(data.admins);
                
                // Update form data in context
                dispatch({
                    type: "SET_FORM_DATA",
                    payload: { admins: data.admins },
                });
                
                // Mark step as completed
                dispatch({
                    type: "SET_STEP_STATUS",
                    payload: { admins: { isDone: true } }
                });

                toast.success("Administrators information saved as draft");
                
                // Refetch form data to get latest values
                if (typeof refetch === "function") {
                    await refetch();
                }
                
                // Trigger table refresh with business ID
                if (onDraftSaved) {
                    onDraftSaved(result.data.business_id);
                }
                
                // Move to next step
                setCurrentStep(prev => prev + 1);
            } else {
                setErrorMsg(result.message || "Failed to save administrators information");
            }
        } catch (error) {
            console.error("Error saving administrators information:", error);
            setErrorMsg("An error occurred while saving administrators information.");
            toast.error("Failed to save administrators information");
        } finally {
            setLoading(false);
        }
    };

    const addAdmin = () => {
        append({ firstName: "", lastName: "", middleName: "", email: "" });
    };

    const removeAdmin = (index) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div className="mt-6 space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">
                        Business Administrators
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-dark-200">
                        Add the administrators who will manage this business account.
                    </p>
                </div>

                {errorMsg && (
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                        <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="border border-gray-200 rounded-lg p-4 dark:border-dark-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="size-5 text-gray-400" />
                                    <h4 className="font-medium text-gray-800 dark:text-dark-100">
                                        Administrator {index + 1}
                                    </h4>
                                </div>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        onClick={() => removeAdmin(index)}
                                        variant="outlined"
                                        isIcon
                                        className="size-8 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                    >
                                        <TrashIcon className="size-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <Input
                                    {...register(`admins.${index}.firstName`)}
                                    label="First Name"
                                    placeholder="Enter first name"
                                    prefix={<UserIcon className="h-5 w-5 text-gray-400" />}
                                    error={errors?.admins?.[index]?.firstName?.message}
                                    required
                                />
                                <Input
                                    {...register(`admins.${index}.lastName`)}
                                    label="Last Name"
                                    placeholder="Enter last name"
                                    prefix={<UserIcon className="h-5 w-5 text-gray-400" />}
                                    error={errors?.admins?.[index]?.lastName?.message}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2 mt-4">
                                <Input
                                    {...register(`admins.${index}.middleName`)}
                                    label="Middle Name"
                                    placeholder="Enter middle name (optional)"
                                    prefix={<IdentificationIcon className="h-5 w-5 text-gray-400" />}
                                    error={errors?.admins?.[index]?.middleName?.message}
                                />
                                <Input
                                    {...register(`admins.${index}.email`)}
                                    label="Email Address"
                                    type="email"
                                    placeholder="Enter email address"
                                    prefix={<AtSymbolIcon className="h-5 w-5 text-gray-400" />}
                                    error={errors?.admins?.[index]?.email?.message}
                                    required
                                />
                            </div>
                        </div>
                    ))}
                </div>

            <div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={addAdmin}
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Administrator
                </Button>
            </div>
            </div>

            {/* Navigation Buttons */}
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

Admins.propTypes = {
    setCurrentStep: PropTypes.func.isRequired,
    onDraftSaved: PropTypes.func,
    refetchFormData: PropTypes.func,
};
