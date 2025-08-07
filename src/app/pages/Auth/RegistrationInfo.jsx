// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import {
    UserIcon,
    BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import Logo from "assets/WekaOda.svg?react";
import { Button, Card, Input, InputErrorMsg } from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import { Page } from "components/shared/Page";

// ----------------------------------------------------------------------
// Schema
const schema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    middleName: yup.string().nullable(),
    lastName: yup.string().required("Last name is required"),
    businessName: yup.string().required("Business name is required"),
    businessType: yup
        .object()
        .nullable()
        .required("Business type is required"),
});

// Business Type Options
const businessTypes = [
    { id: "anchor", name: "Anchor" },
    { id: "supplier", name: "Supplier" },
];

// ----------------------------------------------------------------------

export default function RegistrationInfo() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            firstName: "",
            middleName: "",
            lastName: "",
            businessName: "",
            businessType: null,
        },
    });

    const onSubmit = async (data) => {
        try {
            console.log("Submitted registration info:", data);

            // Simulate API delay — replace this with your API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // On success, navigate to login
            navigate("/login");
        } catch (err) {
            console.error("Registration failed", err);
        }
    };

    return (
        <Page title="Complete Registration">
            <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
                <div className="w-full max-w-[26rem] p-4 sm:px-5">
                    <div className="text-center">
                        <Logo className="mx-auto size-16" />
                        <div className="mt-4">
                            <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                                Complete Registration
                            </h2>
                            <p className="text-gray-400 dark:text-dark-300">
                                Enter your personal and business details
                            </p>
                        </div>
                    </div>

                    <Card className="mt-5 rounded-lg p-5 lg:p-7">
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="space-y-4">

                                <Input
                                    label="First Name"
                                    placeholder="Enter First Name"
                                    prefix={<UserIcon className="size-5" />}
                                    {...register("firstName")}
                                    error={errors?.firstName?.message}
                                />

                                <Input
                                    label="Last Name"
                                    placeholder="Enter Last Name"
                                    prefix={<UserIcon className="size-5" />}
                                    {...register("lastName")}
                                    error={errors?.lastName?.message}
                                />

                                <Input
                                    label={
                                        <>
                                            Middle Name{" "}
                                            <span className="text-xs text-gray-400 dark:text-dark-300">
                                                (Optional)
                                            </span>
                                        </>
                                    }
                                    placeholder="Enter Middle Name"
                                    prefix={<UserIcon className="size-5" />}
                                    {...register("middleName")}
                                    error={errors?.middleName?.message}
                                />

                                <Input
                                    label="Business Name"
                                    placeholder="Enter Business Name"
                                    prefix={<BuildingStorefrontIcon className="size-5" />}
                                    {...register("businessName")}
                                    error={errors?.businessName?.message}
                                />

                                <Controller
                                    control={control}
                                    name="businessType"
                                    render={({ field }) => (
                                        <Combobox
                                            data={businessTypes}
                                            displayField="name"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select Business Type"
                                            label="Business Type"
                                            searchFields={["name"]}
                                            error={errors?.businessType?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div className="mt-4">
                                <InputErrorMsg when={!!errors?.businessType}>
                                    {errors?.businessType?.message}
                                </InputErrorMsg>
                            </div>

                            <Button type="submit" className="mt-5 w-full" color="primary">
                                Complete Registration
                            </Button>
                        </form>
                    </Card>
                </div>
            </main>
        </Page>
    );
}
