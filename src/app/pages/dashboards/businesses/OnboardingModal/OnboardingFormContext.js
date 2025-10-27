import { createSafeContext } from "utils/createSafeContext";

export const [OnboardingFormContextProvider, useOnboardingFormContext] = createSafeContext(
    "useOnboardingFormContext must be used within a OnboardingFormContextProvider",
);
