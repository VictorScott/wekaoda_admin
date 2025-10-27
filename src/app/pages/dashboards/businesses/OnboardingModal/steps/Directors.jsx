import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    PlusIcon,
    TrashIcon,
    UserIcon,
    EnvelopeIcon,
    BriefcaseIcon,
} from "@heroicons/react/24/outline";
import {Input, Button, GhostSpinner} from "components/ui";
import { useOnboardingFormContext } from "../OnboardingFormContext";
import { directorsSchema } from "../schema";
import { useDispatch } from "react-redux";
import { saveDraft } from "store/slices/businessSlice";
import { toast } from "sonner";

export function Directors({ setCurrentStep, onDraftSaved }) {
    const { state, dispatch, refetchFormData } = useOnboardingFormContext();
    const reduxDispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const safeDirectors = Array.isArray(state.formData.directors_names)
        ? state.formData.directors_names.map((d) => ({
            name: d?.name || "",
            email: d?.email || "",
            position: d?.position || "",
        }))
        : [{ name: "", email: "", position: "" }];

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(directorsSchema),
        defaultValues: {
            directors_names: safeDirectors,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "directors_names",
    });

    useEffect(() => {
        let directorsData = [];

        if (Array.isArray(state.formData.directors_names)) {
            directorsData = state.formData.directors_names;
        } else if (
            state.formData.directors_names &&
            typeof state.formData.directors_names === "object"
        ) {
            directorsData = Object.values(state.formData.directors_names);
        }

        const safeMapped = directorsData.map((d) => ({
            name: d?.name || "",
            email: d?.email || "",
            position: d?.position || "",
        }));

        reset({
            directors_names:
                safeMapped.length > 0 ? safeMapped : [{ name: "", email: "", position: "" }],
        });
    }, [state.formData.directors_names, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMsg("");

        try {
            // Save draft to backend
            const result = await reduxDispatch(saveDraft({
                businessId: state.businessId,
                step: 'directors',
                data: { directors_names: data.directors_names }
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
                    payload: { directors_names: data.directors_names }
                });

                // Mark step as completed
                dispatch({
                    type: "SET_STEP_STATUS",
                    payload: { directors: { isDone: true } }
                });

                toast.success("Directors information saved as draft");
                
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
                setErrorMsg(result.message || "Failed to save directors information");
            }
        } catch (error) {
            console.error("Error saving directors information:", error);
            setErrorMsg(error.message || "Failed to save directors information");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((item, index) => (
                <div
                    key={item.id}
                    className="rounded border border-gray-300 dark:border-dark-600 p-4 shadow-sm bg-white dark:bg-dark-800"
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Input
                            {...register(`directors_names.${index}.name`)}
                            label="Name"
                            placeholder="Enter name"
                            prefix={<UserIcon className="w-5 h-5 text-gray-400" />}
                            error={errors?.directors_names?.[index]?.name?.message}
                        />
                        <Input
                            {...register(`directors_names.${index}.email`)}
                            label="Email"
                            placeholder="Enter email"
                            prefix={<EnvelopeIcon className="w-5 h-5 text-gray-400" />}
                            error={errors?.directors_names?.[index]?.email?.message}
                        />
                        <Input
                            {...register(`directors_names.${index}.position`)}
                            label="Position"
                            placeholder="e.g. CEO"
                            prefix={<BriefcaseIcon className="w-5 h-5 text-gray-400" />}
                            error={errors?.directors_names?.[index]?.position?.message}
                        />
                    </div>

                    {fields.length > 1 && (
                        <div className="mt-2 text-right">
                            <Button
                                type="button"
                                variant="text"
                                size="sm"
                                color="error"
                                onClick={() => remove(index)}
                            >
                                <TrashIcon className="w-4 h-4" />
                                Remove
                            </Button>
                        </div>
                    )}
                </div>
            ))}

            <div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ name: "", email: "", position: "" })}
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Director
                </Button>
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
                <Button
                    type="submit"
                    className="min-w-[7rem]"
                    color="primary"
                    disabled={loading}
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

Directors.propTypes = {
    setCurrentStep: PropTypes.func.isRequired,
    onDraftSaved: PropTypes.func,
};
