import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input, GhostSpinner } from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import { fetchKYCDocTypes, saveKYCDocType, fetchBusinessTypes } from "store/slices/kycDocTypesSlice";
import {
    XMarkIcon,
    DocumentTextIcon,
    BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { toast } from "sonner";

const schema = yup.object().shape({
    doc_name: yup.string().required("Document name is required"),
    requirement_level: yup.object().nullable().required("Requirement level is required"),
    business_type: yup.object().nullable().required("Business type is required"),
    expires_type: yup.object().nullable().required("Expires type is required"),
});

const requirementLevels = [
    { id: "mandatory", name: "Mandatory" },
    { id: "optional", name: "Optional" },
];

const expiresTypes = [
    { id: "yes", name: "Expires" },
    { id: "permanent", name: "Permanent" },
];

export default function AddEditKYCDocTypeModal({ open, onClose, kycDocType, onSuccess }) {
    
    const dispatch = useDispatch();
    const saveRef = useRef(null);
    const { businessTypes, businessTypesLoading } = useSelector((state) => state.kycDocTypes);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            doc_name: "",
            requirement_level: null,
            business_type: null,
            expires_type: null,
        },
    });

    useEffect(() => {
        if (open && businessTypes.length === 0) {
            dispatch(fetchBusinessTypes());
        }
    }, [open, businessTypes.length, dispatch]);

    useEffect(() => {
        if (kycDocType) {
            const businessTypeObj = businessTypes.find(bt => bt.type === kycDocType.business_type);
            const requirementLevelObj = requirementLevels.find(rl => rl.id === kycDocType.requirement_level);
            const expiresTypeObj = expiresTypes.find(et => et.id === kycDocType.expires_type);

            reset({
                doc_name: kycDocType.doc_name || "",
                requirement_level: requirementLevelObj || null,
                business_type: businessTypeObj || null,
                expires_type: expiresTypeObj || null,
            });
        } else {
            reset({
                doc_name: "",
                requirement_level: null,
                business_type: null,
                expires_type: null,
            });
        }
    }, [kycDocType, businessTypes, reset]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                doc_name: data.doc_name,
                requirement_level: data.requirement_level?.id || data.requirement_level,
                business_type: data.business_type?.type || data.business_type,
                expires_type: data.expires_type?.id || data.expires_type,
                ...(kycDocType && { kyc_doc_type_id: kycDocType.id }),
            };

            const response = await dispatch(saveKYCDocType(payload)).unwrap();

            if (response.success === false) {
                const errorMessage =
                    response.message ||
                    (response.errors && Object.values(response.errors)[0]?.[0]) ||
                    "Failed to save KYC document type.";
                toast.error(errorMessage);
                return;
            }

            // Success toast and cleanup
            toast.success(`KYC document type ${kycDocType ? "updated" : "created"} successfully!`);
            
            // Refresh table data on success
            dispatch(fetchKYCDocTypes());
            onSuccess?.();
            onClose();
            
        } catch (error) {
            console.error(error);
            const errorMessage =
                error?.message ||
                (error?.errors && Object.values(error.errors)[0]?.[0]) ||
                "Something went wrong.";
            toast.error(errorMessage);
        }
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
                onClose={onClose}
                initialFocus={saveRef}
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
                    <DialogPanel className="relative flex w-full max-w-lg origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
                        <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <DialogTitle className="text-base font-medium text-gray-800 dark:text-dark-100">
                                {kycDocType ? "Edit KYC Document" : "Add KYC Document"}
                            </DialogTitle>
                            <Button
                                onClick={onClose}
                                variant="flat"
                                isIcon
                                className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                            >
                                <XMarkIcon className="size-4.5" />
                            </Button>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5 space-y-4"
                            noValidate
                        >
                            <Input
                                label="Document Name"
                                placeholder="Enter document name"
                                prefix={<DocumentTextIcon className="size-5" />}
                                {...register("doc_name")}
                                error={errors.doc_name?.message}
                                autoComplete="off"
                            />

                            <Controller
                                control={control}
                                name="requirement_level"
                                render={({ field }) => (
                                    <Combobox
                                        data={requirementLevels}
                                        displayField="name"
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select requirement level"
                                        label="Requirement Level"
                                        searchFields={["name"]}
                                        error={errors.requirement_level?.message}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="business_type"
                                render={({ field }) => (
                                    <Combobox
                                        data={businessTypes}
                                        displayField="name"
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select business type"
                                        label="Business Type"
                                        searchFields={["name"]}
                                        error={errors.business_type?.message}
                                        loading={businessTypesLoading}
                                        prefix={<BuildingOfficeIcon className="size-5" />}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="expires_type"
                                render={({ field }) => (
                                    <Combobox
                                        data={expiresTypes}
                                        displayField="name"
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select expires type"
                                        label="Expires Type"
                                        searchFields={["name"]}
                                        error={errors.expires_type?.message}
                                    />
                                )}
                            />
                        </form>

                        <div className="space-x-3 flex justify-end rounded-b-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                className="min-w-[7rem]"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                color="primary"
                                ref={saveRef}
                                className="min-w-[7rem] flex items-center justify-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <GhostSpinner className="size-4 border-2 border-white/30 border-t-white" />
                                )}
                                <span>
                                    {isSubmitting 
                                        ? (kycDocType ? "Updating..." : "Creating...") 
                                        : (kycDocType ? "Update" : "Create")
                                    }
                                </span>
                            </Button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

AddEditKYCDocTypeModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    kycDocType: PropTypes.object,
    onSuccess: PropTypes.func,
};
