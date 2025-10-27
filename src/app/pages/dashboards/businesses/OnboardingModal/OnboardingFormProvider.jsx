import PropTypes from "prop-types";
import { useReducer, useCallback, useEffect } from "react";
import { OnboardingFormContextProvider } from "./OnboardingFormContext";
import { useDispatch } from "react-redux";
import { getSingleBusiness } from "store/slices/businessSlice";
import { toast } from "sonner";

const initialState = {
  businessId: null,
  formData: {
    businessDetails: {
      businessName: "",
      registrationNumber: "",
      natureOfBusiness: "",
      countryOfRegistration: "",
      dateOfRegistration: null,
      businessType: "",
      businessLevel: "",
    },
    businessAddress: {
      registeredOffice: "",
      registeredOfficeAddress: "",
      postalAddress: "",
      postalCode: "",
      dialCode: "",
      phone: "",
      businessEmail: "",
      websiteUrl: "",
      address: "",
    },
    directors_names: [{ name: "", email: "", position: "" }],
    financialInfo: {
      source_of_wealth: "",
      source_of_funds: "",
      expected_annual_turnover: "",
      tinNumber: "",
    },
    kycDocuments: { docs: [] },
    declaration: { agreed: false, fullName: "" },
    meta: {
      business_status: "",
      verificationStatus: "",
      kycStatus: "",
      business_type: "",
      correction_comments: null,
    },
  },
  stepStatus: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_BUSINESS_ID":
      return { ...state, businessId: action.payload };
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          ...Object.entries(action.payload).reduce((acc, [key, incomingData]) => {
            const existingData = state.formData[key];

            if (key === "directors_names") {
              let safeArray = [];

              if (Array.isArray(incomingData)) {
                safeArray = incomingData;
              } else if (typeof incomingData === "object" && incomingData !== null) {
                safeArray = Object.values(incomingData);
              }

              acc[key] = safeArray.map((d) => ({
                name: d?.name || "",
                email: d?.email || "",
                position: d?.position || "",
              }));

            } else if (key === "meta") {
              acc[key] = { ...incomingData };
            } else if (Array.isArray(existingData) && Array.isArray(incomingData)) {
              acc[key] = incomingData;
            } else {
              acc[key] = { ...existingData, ...incomingData };
            }

            return acc;
          }, {}),
        },
      };
    case "SET_STEP_STATUS":
      return { ...state, stepStatus: { ...state.stepStatus, ...action.payload } };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
};

export function OnboardingFormProvider({ children, draftData }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const reduxDispatch = useDispatch();

  // Load draft data when component mounts or draftData changes
  useEffect(() => {
    if (draftData) {
      // Set business ID if available
      if (draftData.business_id) {
        dispatch({ type: "SET_BUSINESS_ID", payload: draftData.business_id });
      }
      
      // Convert table data to form structure
      const formData = {
        businessDetails: {
          businessName: draftData.business_name || "",
          registrationNumber: draftData.registration_number || "",
          businessLevel: draftData.business_level || "",
          businessType: draftData.business_type || "",
          businessEmail: draftData.business_email || "",
          mobileNumber: draftData.mobile_number || "",
          websiteUrl: draftData.website_url || "",
          natureOfBusiness: draftData.nature_of_business || "",
          countryOfRegistration: draftData.country_of_registration || "",
          dateOfRegistration: draftData.date_of_registration || null,
        },
        businessAddress: {
          registeredOfficeAddress: draftData.registered_office_address || "",
          registeredOffice: draftData.registered_office || "",
          address: draftData.address || "",
          city: draftData.city || "",
          state: draftData.state || "",
          postalCode: draftData.postal_code || "",
          postalAddress: draftData.postal_address || "",
          postalCity: draftData.postal_city || "",
          postalState: draftData.postal_state || "",
          postalPostalCode: draftData.postal_postal_code || "",
          postalCountry: draftData.postal_country || "",
          dialCode: draftData.mobile_country_code || "",
          phone: draftData.mobile_number || "",
          businessEmail: draftData.business_email || "",
          websiteUrl: draftData.website_url || "",
        },
        directors_names: draftData.directors_names || [{ name: "", email: "", position: "" }],
        admins: draftData.admins?.map(admin => ({
          firstName: admin.first_name || "",
          lastName: admin.last_name || "",
          middleName: admin.middle_name || "",
          email: admin.email || "",
        })) || [{ firstName: "", lastName: "", middleName: "", email: "" }],
        financialInfo: {
          source_of_wealth: draftData.source_of_wealth || "",
          source_of_funds: draftData.source_of_funds || "",
          expected_annual_turnover: draftData.expected_annual_turnover || "",
          tinNumber: draftData.tin_number || "",
        },
        kycDocuments: { 
          docs: draftData.kyc_docs?.map(doc => ({
            id: doc.id,
            doc_id: doc.doc_id,
            doc_name: doc.doc_name || 'Document',
            requirement_level: doc.requirement_level || 'required',
            expires_type: doc.expires_type || 'never',
            approval_status: doc.approval_status,
            url: doc.url,
            expires_on: doc.expires_on,
            file: null,
          })) || []
        },
        declaration: { agreed: false, fullName: "" },
        meta: {
          business_status: draftData.status || "",
          verificationStatus: draftData.verification_status || "",
          kycStatus: draftData.kyc_status || "",
          business_type: draftData.business_type || "",
          correction_comments: null,
        },
      };
      
      // Load converted form data
      dispatch({ type: "SET_FORM_DATA", payload: formData });
    }
  }, [draftData]);

  const refetchFormData = useCallback(async () => {
    const businessId = state.businessId;
    if (!businessId) return;

    try {
      await toast.promise(
        reduxDispatch(getSingleBusiness({ businessId })),
        {
          loading: "Updating form data...",
          success: (result) => {
            if (result.payload && result.payload.success) {
              const businessData = result.payload.data;
              
              // Convert table data to form structure
              const formData = {
                businessDetails: {
                  businessName: businessData.business_name || "",
                  registrationNumber: businessData.registration_number || "",
                  businessLevel: businessData.business_level || "",
                  businessType: businessData.business_type || "",
                  businessEmail: businessData.business_email || "",
                  mobileNumber: businessData.mobile_number || "",
                  websiteUrl: businessData.website_url || "",
                  natureOfBusiness: businessData.nature_of_business || "",
                  countryOfRegistration: businessData.country_of_registration || "",
                  dateOfRegistration: businessData.date_of_registration || null,
                },
                businessAddress: {
                  registeredOfficeAddress: businessData.registered_office_address || "",
                  registeredOffice: businessData.registered_office || "",
                  address: businessData.address || "",
                  city: businessData.city || "",
                  state: businessData.state || "",
                  postalCode: businessData.postal_code || "",
                  postalAddress: businessData.postal_address || "",
                  postalCity: businessData.postal_city || "",
                  postalState: businessData.postal_state || "",
                  postalPostalCode: businessData.postal_postal_code || "",
                  postalCountry: businessData.postal_country || "",
                  dialCode: businessData.mobile_country_code || "",
                  phone: businessData.mobile_number || "",
                  businessEmail: businessData.business_email || "",
                  websiteUrl: businessData.website_url || "",
                },
                directors_names: businessData.directors_names || [{ name: "", email: "", position: "" }],
                admins: businessData.admins?.map(admin => ({
                  firstName: admin.first_name || "",
                  lastName: admin.last_name || "",
                  middleName: admin.middle_name || "",
                  email: admin.email || "",
                })) || [{ firstName: "", lastName: "", middleName: "", email: "" }],
                financialInfo: {
                  source_of_wealth: businessData.source_of_wealth || "",
                  source_of_funds: businessData.source_of_funds || "",
                  expected_annual_turnover: businessData.expected_annual_turnover || "",
                  tinNumber: businessData.tin_number || "",
                },
                kycDocuments: { 
                  docs: businessData.kyc_docs?.map(doc => ({
                    id: doc.id,
                    doc_id: doc.doc_id,
                    doc_name: doc.doc_name || 'Document',
                    requirement_level: doc.requirement_level || 'required',
                    expires_type: doc.expires_type || 'never',
                    approval_status: doc.approval_status,
                    url: doc.url,
                    expires_on: doc.expires_on,
                    file: null,
                  })) || []
                },
                declaration: { agreed: false, fullName: "" },
                meta: {
                  business_status: businessData.status || "",
                  verificationStatus: businessData.verification_status || "",
                  kycStatus: businessData.kyc_status || "",
                  business_type: businessData.business_type || "",
                  correction_comments: null,
                },
              };
              
              dispatch({ type: "SET_FORM_DATA", payload: formData });
              return "Form updated successfully!";
            } else {
              throw new Error("Failed to load form data.");
            }
          },
          error: (err) =>
            err.response?.data?.message || "Failed to load form data. Please try again.",
        }
      );
    } catch (err) {
      console.error("Refetch form data failed", err);
    }
  }, [state.businessId, reduxDispatch]);

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
  }, [dispatch]);

  const value = { state, dispatch, resetForm, refetchFormData };

  return <OnboardingFormContextProvider value={value}>{children}</OnboardingFormContextProvider>;
}

OnboardingFormProvider.propTypes = {
  children: PropTypes.node,
  draftData: PropTypes.object,
};
