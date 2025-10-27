import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState, useRef } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Card, Button } from "components/ui";
import { OnboardingFormProvider } from "./OnboardingFormProvider";
import { Stepper } from "./Stepper";
import { UnderReview } from "./UnderReview";
import { Declaration } from "./steps/Declaration.jsx";
import { BusinessDetails } from "./steps/BusinessDetails.jsx";
import { BusinessAddress } from "./steps/BusinessAddress.jsx";
import { Directors } from "./steps/Directors.jsx";
import { FinancialInfo } from "./steps/FinancialInfo.jsx";
import { KYCDocuments } from "./steps/KYCDocuments.jsx";
import { Admins } from "./steps/Admins.jsx";
import { useOnboardingFormContext } from "./OnboardingFormContext.js";

const allSteps = [
  { key: "businessDetails", component: BusinessDetails, label: "Business Details", description: "Provide core business information like name, type, and registration." },
  { key: "businessAddress", component: BusinessAddress, label: "Business Address", description: "Provide registered office, postal, and contact details." },
  { key: "directors", component: Directors, label: "Directors", description: "List all directors associated with this business." },
  { key: "financialInfo", component: FinancialInfo, label: "Financial Info", description: "Provide tax, revenue, and ownership information." },
  { key: "kycDocuments", component: KYCDocuments, label: "KYC Documents", description: "Upload required business documents." },
  { key: "admins", component: Admins, label: "Administrators", description: "Add administrators who will manage this business account." },
  { key: "declaration", component: Declaration, label: "Declaration", description: "Confirm and agree to the information submitted." },
];

// Business types that don't require directors step
const BUSINESS_TYPES_WITHOUT_DIRECTORS = ['sole_proprietorship'];

function OnboardingFormInner({ onSuccess, onClose, onDraftSaved }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const { state, dispatch, resetForm, refetchFormData } = useOnboardingFormContext();

  // Filter steps based on business type (check both locations for business type)
  const businessType = state?.formData?.businessDetails?.businessType || state?.formData?.meta?.business_type;
  const businessTypeValue = businessType?.type || businessType;
  const shouldSkipDirectors = BUSINESS_TYPES_WITHOUT_DIRECTORS.includes(businessTypeValue);
  
  const steps = allSteps.filter(step => {
    if (step.key === 'directors' && shouldSkipDirectors) {
      return false;
    }
    return true;
  });

  // Auto-complete directors step if it's skipped for this business type
  useEffect(() => {
    if (shouldSkipDirectors && state?.formData && !state?.stepStatus?.directors?.isDone) {
      dispatch({ 
        type: "SET_STEP_STATUS", 
        payload: { directors: { isDone: true } } 
      });
    }
  }, [shouldSkipDirectors, state?.formData, state?.stepStatus?.directors?.isDone, dispatch]);

  // Initial refetch when opening for draft update
  useEffect(() => {
    if (state.businessId && refetchFormData) {
      refetchFormData();
    }
  }, [state.businessId, refetchFormData]);

  // Handle step navigation when business type changes
  useEffect(() => {
    if (businessTypeValue && steps.length > 0) {
      // If current step is directors but directors step is now filtered out, move to next available step
      const currentStepKey = allSteps[currentStep]?.key;
      if (currentStepKey === 'directors' && shouldSkipDirectors) {
        // Find the next available step after directors
        const nextStepIndex = steps.findIndex(step => step.key === 'financialInfo');
        if (nextStepIndex !== -1) {
          setCurrentStep(nextStepIndex);
        }
      }
      
      // If current step index is beyond available steps, adjust to last available step
      if (currentStep >= steps.length) {
        setCurrentStep(steps.length - 1);
      }
    }
  }, [businessTypeValue, shouldSkipDirectors, steps, currentStep]);

  // Removed automatic finished state setting - now handled by Declaration component directly

  const handleClose = () => {
    resetForm();
    setCurrentStep(0);
    setFinished(false);
    onClose();
  };

  const ActiveForm = steps[currentStep]?.component;

  const stepsNode = (
      <>
        <div className="col-span-12 sm:order-last sm:col-span-4 lg:col-span-3">
          <div className="sticky top-24 sm:mt-3">
            <Stepper
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
            />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-8 lg:col-span-9">
          <Card className="h-full p-4 sm:p-5">
            <div className="mb-6">
              <h5 className="text-lg font-medium text-gray-800 dark:text-dark-100">
                {steps[currentStep]?.label}
              </h5>
              <p className="text-sm text-gray-500 dark:text-dark-200">
                {steps[currentStep]?.description}
              </p>
            </div>

            {!finished && ActiveForm && (
                <ActiveForm
                    setCurrentStep={setCurrentStep}
                    onDraftSaved={onDraftSaved}
                    refetchFormData={refetchFormData}
                    onSuccess={onSuccess}
                />
            )}
          </Card>
        </div>
      </>
  );

  return (
      <div
          className={clsx(
              "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6 h-[600px]",
              !finished && "grid-rows-[auto_1fr] sm:grid-rows-none"
          )}
      >
        {finished ? (
            <div className="col-span-12 place-self-center">
              <UnderReview 
                onSuccess={onSuccess}
                onClose={handleClose}
              />
            </div>
        ) : (
            stepsNode
        )}
      </div>
  );
}

export function OnboardingModal({ open, onClose, onSuccess, onDraftSaved, draftData }) {
    const closeButtonRef = useRef(null);

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
                onClose={onClose}
                initialFocus={closeButtonRef}
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
                    <DialogPanel className="relative flex w-full max-w-7xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
                        <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <DialogTitle className="text-base font-medium text-gray-800 dark:text-dark-100">
                                Onboard New Business
                            </DialogTitle>
                            <Button
                                onClick={onClose}
                                variant="flat"
                                isIcon
                                className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                                ref={closeButtonRef}
                            >
                                <XMarkIcon className="size-4.5" />
                            </Button>
                        </div>

                        <div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                            <OnboardingFormProvider draftData={draftData}>
                                <OnboardingFormInner onSuccess={onSuccess} onClose={onClose} onDraftSaved={onDraftSaved} />
                            </OnboardingFormProvider>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

OnboardingFormInner.propTypes = {
    onSuccess: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    onDraftSaved: PropTypes.func,
};

OnboardingModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    onDraftSaved: PropTypes.func,
    draftData: PropTypes.object,
};
