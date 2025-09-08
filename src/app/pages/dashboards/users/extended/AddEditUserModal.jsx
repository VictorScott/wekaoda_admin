import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input, GhostSpinner } from "components/ui";
import { fetchUsers, saveUser } from "store/slices/usersSlice";
import {
    XMarkIcon,
    EnvelopeIcon,
    UserIcon,
    IdentificationIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { toast } from "sonner";

const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    name: yup.string().required("Name is required"),
    occupation: yup.string().nullable(),
});

export default function AddEditUserModal({ open, onClose, user, onSuccess }) {
    
    const dispatch = useDispatch();
    const saveRef = useRef(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            email: "",
            name: "",
            occupation: "",
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                email: user.email || "",
                name: user.name || "",
                occupation: user.occupation || "",
            });
        } else {
            reset({
                email: "",
                name: "",
                occupation: "",
            });
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        try {
            const response = await dispatch(
                saveUser({
                    ...data,
                    ...(user && { user_id: user.id }),
                })
            ).unwrap();

            if (response.success === false) {
                const errorMessage =
                    response.message ||
                    (response.errors && Object.values(response.errors)[0]?.[0]) ||
                    "Failed to save user.";
                toast.error(errorMessage);
                return;
            }

            // Success toast and cleanup
            toast.success(`User ${user ? "updated" : "created"} successfully!`);
            
            // Refresh table data on success
            dispatch(fetchUsers());
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
                                {user ? "Edit User" : "Add User"}
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
                                label="Email"
                                placeholder="Enter email"
                                prefix={<EnvelopeIcon className="size-5" />}
                                {...register("email")}
                                disabled={!!user}
                                error={errors.email?.message}
                                autoComplete="email"
                            />

                            <Input
                                label="Full Name"
                                placeholder="Enter full name"
                                prefix={<UserIcon className="size-5" />}
                                {...register("name")}
                                error={errors.name?.message}
                                autoComplete="name"
                            />

                            <Input
                                label="Occupation"
                                placeholder="Enter occupation"
                                prefix={<IdentificationIcon className="size-5" />}
                                {...register("occupation")}
                                error={errors.occupation?.message}
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
                                        ? (user ? "Updating..." : "Creating...") 
                                        : (user ? "Update User" : "Create User")
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

AddEditUserModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    user: PropTypes.object,
    onSuccess: PropTypes.func,
};
