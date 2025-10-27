import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as Yup from 'yup'

dayjs.extend(isBetween)

export const businessDetailsSchema = Yup.object().shape({
    businessName: Yup.string().required("Business name is required"),
    registrationNumber: Yup.string().required("Registration number is required"),
    natureOfBusiness: Yup.string().required("Nature of business is required"),
    countryOfRegistration: Yup.string().required("Country is required"),
    dateOfRegistration: Yup.date()
        .max(new Date(), "Registration date can't be in the future")
        .required("Date of registration is required"),
    businessType: Yup.string().required("Business type is required"),
});

export const businessAddressSchema = Yup.object().shape({
    registeredOffice: Yup.string().required("Registered office is required"),
    registeredOfficeAddress: Yup.string().required("Registered office address is required"),
    postalAddress: Yup.string().required("Postal address is required"),
    postalCode: Yup.string().required("Postal code is required"),
    dialCode: Yup.string().required("Dial code is required"),
    phone: Yup.string().required("Phone number is required"),
    businessEmail: Yup.string().email("Invalid email").required("Business email is required"),
    websiteUrl: Yup.string().url("Enter a valid website URL").nullable(),
    address: Yup.string().required("Business address is required"),
});

export const directorsSchema = Yup.object().shape({
    directors_names: Yup.array()
        .of(
            Yup.object().shape({
                name: Yup.string().required("Name is required"),
                email: Yup.string().email("Invalid email").required("Email is required"),
                position: Yup.string().required("Position is required"),
            })
        )
        .min(1, "Add at least one director"),
});

export const financialInfoSchema = Yup.object().shape({
    source_of_wealth: Yup.string()
        .required("Source of wealth is required")
        .max(255),
    source_of_funds: Yup.string()
        .required("Source of funds is required")
        .max(255),
    expected_annual_turnover: Yup.number()
        .typeError("Expected turnover must be a number")
        .positive("Turnover must be a positive number")
        .required("Expected annual turnover is required"),
});

export function buildKYCDocumentSchema(documentList) {
    return Yup.object({
        docs: Yup.array()
            .of(
                Yup.object({
                    file: Yup.mixed()
                        .nullable()
                        .test(
                            "fileSize",
                            "Max file size is 4MB",
                            (file) => !file || (file.size <= 4 * 1024 * 1024)
                        )
                        .test("requiredFile", "File is required", function (file) {
                            const { path } = this;
                            const indexMatch = path.match(/\[(\d+)\]/);
                            const index = indexMatch ? Number(indexMatch[1]) : null;

                            if (index !== null && documentList[index]) {
                                if (documentList[index].requirement_level === "required") {
                                    return file != null;
                                }
                                return true; // optional docs can be empty
                            }
                            return true;
                        }),
                })
            )
            .required(),
    });
}

export const declarationSchema = Yup.object().shape({
    // No fields required - admin onboarding auto-completes
});

