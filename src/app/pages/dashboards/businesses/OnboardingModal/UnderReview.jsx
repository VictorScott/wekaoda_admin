import { useState } from "react";
import PropTypes from "prop-types";
import ReviewIllustration from "assets/illustrations/review.svg?react";
import { useThemeContext } from "app/contexts/theme/context";
import { Button, Spinner } from "components/ui";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { onboardBusiness } from "store/slices/businessSlice";
import { useOnboardingFormContext } from "./OnboardingFormContext";

export function UnderReview({ onSuccess, onClose }) {
  const theme = useThemeContext();
  const dispatch = useDispatch();
  const { state } = useOnboardingFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = state.formData;
      
      // Prepare the payload for the backend
      const payload = {
        // Business Details
        businessName: formData.businessDetails.businessName,
        registrationNumber: formData.businessDetails.registrationNumber,
        business_level: formData.businessDetails.businessLevel?.level || formData.businessDetails.businessLevel,
        business_type: formData.businessDetails.businessType?.type || formData.businessDetails.businessType,
        natureOfBusiness: formData.businessDetails.natureOfBusiness,
        countryOfRegistration: formData.businessDetails.countryOfRegistration,
        dateOfRegistration: formData.businessDetails.dateOfRegistration,
        
        // Business Address
        businessEmail: formData.businessAddress.businessEmail,
        mobileNumber: formData.businessAddress.phone,
        websiteUrl: formData.businessAddress.websiteUrl,
        registeredAddress: formData.businessAddress.registeredOfficeAddress,
        city: formData.businessAddress.address?.split(',')[0] || '',
        state: formData.businessAddress.address?.split(',')[1] || '',
        postalCode: formData.businessAddress.postalCode,
        country: formData.businessDetails.countryOfRegistration || 'Kenya',
        postalAddress: formData.businessAddress.postalAddress,
        
        // Directors (converted to admins)
        admins: formData.directors_names?.map(director => ({
          firstName: director.name?.split(' ')[0] || '',
          middleName: director.name?.split(' ')[1] || '',
          lastName: director.name?.split(' ').slice(2).join(' ') || director.name?.split(' ')[1] || '',
          email: director.email,
        })) || [],
        
        // Financial Info
        tinNumber: formData.financialInfo.tinNumber,
        
        // Documents
        documents: formData.kycDocuments?.docs?.map(doc => ({
          id: doc.id,
          name: doc.name,
          file: doc.file,
        })) || [],
        
        // Declaration
        declaration: formData.declaration.agreed,
      };

      const result = await dispatch(onboardBusiness(payload)).unwrap();

      if (result.success) {
        toast.success(result.message || "Business onboarded successfully!");
        if (onSuccess) {
          onSuccess(result.data.business);
        }
        onClose();
      } else {
        toast.error(result.message || "Failed to onboard business. Please try again.");
      }
    } catch (error) {
      console.error("Onboarding failed:", error);
      toast.error(error.message || "Failed to onboard business. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full text-center">
      <ReviewIllustration
        className="mx-auto h-auto w-56 sm:w-64"
        style={{
          "--primary": theme.primaryColorScheme[600],
          "--darker": theme.darkColorScheme[600],
        }}
      />
      <p className="mt-6 pt-4 text-xl font-semibold text-gray-800 dark:text-dark-50">
        Ready to Create Business
      </p>
      <p className="mx-auto mt-2 max-w-2xl text-balance sm:px-5 text-gray-500 dark:text-gray-400">
        All information has been collected. Click the button below to create the business account. 
        The business will be automatically verified and welcome emails will be sent to all administrators.
      </p>
      
      <div className="mt-8">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          color="primary"
          className="inline-flex items-center gap-2"
        >
          {isSubmitting ? (
            <Spinner color="white" className="size-4" />
          ) : (
            <CheckCircleIcon className="size-4" />
          )}
          <span>
            {isSubmitting ? "Creating Business..." : "Create Business"}
          </span>
        </Button>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This will create the business and send welcome emails to administrators
        </p>
      </div>
    </div>
  );
}

UnderReview.propTypes = {
  onSuccess: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
