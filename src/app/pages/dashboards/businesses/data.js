export const filtersOptions = [
    {
        value: 'business_level',
        label: 'Level',
    },
    {
        value: 'business_type',
        label: 'Type',
    },
    {
        value: 'status',
        label: 'Status',
    },
    {
        value: 'verification_status',
        label: 'Verification',
    }
];

export const statusOptions = [
    {
        value: 'active',
        label: 'Active',
        color: 'success',
    },
    {
        value: 'suspended',
        label: 'Suspended',
        color: 'error',
    },
    {
        value: 'pending',
        label: 'Pending',
        color: 'warning',
    }
];

export const verificationOptions = [
    {
        value: 'verified',
        label: 'Verified',
        color: 'success',
    },
    {
        value: 'declined',
        label: 'Declined',
        color: 'error',
    },
    {
        value: 'pending',
        label: 'Pending',
        color: 'warning',
    },
    {
        value: 'sent_for_corrections',
        label: 'Sent for Corrections',
        color: 'secondary',
    }
];

export const levelOptions = [
    {
        value: 'Anchor',
        label: 'Anchor',
        color: 'primary',
    },
    {
        value: 'Supplier',
        label: 'Supplier',
        color: 'success',
    }
];

export const businessTypeOptions = [
    {
        value: 'private_limited',
        label: 'Private Limited',
        color: 'primary',
    },
    {
        value: 'public_limited',
        label: 'Public Limited',
        color: 'secondary',
    },
    {
        value: 'sole_proprietorship',
        label: 'Sole Proprietorship',
        color: 'success',
    },
    {
        value: 'partnership',
        label: 'Partnership',
        color: 'warning',
    },
    {
        value: 'non_profit',
        label: 'Non-Profit',
        color: 'neutral',
    }
];

export const kycStatusOptions = [
    {
        value: 'completed',
        label: 'Completed',
        color: 'success',
    },
    {
        value: 'pending',
        label: 'Pending',
        color: 'warning',
    },
    {
        value: 'incomplete',
        label: 'Incomplete',
        color: 'error',
    }
];

export function transformBusinessData(business) {
    if (!business) {
        return {
            businessDetails: {},
            businessAddress: {},
            financialInfo: {},
            directors_names: [],
            kycDocuments: { docs: [] },
        };
    }

    return {
        businessDetails: {
            businessName: business?.business_name || "",
            registrationNumber: business?.registration_number || "",
            natureOfBusiness: business?.nature_of_business || "",
            countryOfRegistration: business?.country_of_registration || "",
            dateOfRegistration: business?.date_of_registration || "",
            businessType: business?.business_type || "",
        },
        businessAddress: {
            registeredOffice: business?.registered_office || "",
            registeredOfficeAddress: business?.registered_office_address || "",
            postalAddress: business?.postal_address || "",
            postalCode: business?.postal_code || "",
            dialCode: business?.mobile_country_code || "",
            phone: business?.mobile_number || "",
            businessEmail: business?.business_email || "",
            websiteUrl: business?.website_url || "",
            address: business?.address || "",
        },
        financialInfo: {
            source_of_wealth: business?.source_of_wealth || "",
            source_of_funds: business?.source_of_funds || "",
            expected_annual_turnover: business?.expected_annual_turnover || "",
            tinNumber: business?.tin_number || "",
        },
        directors_names: business?.directors_names || [],
        kycDocuments: {
            docs: business?.kyc_docs || [],
        },
    };
}

