import PropTypes from "prop-types";
import clsx from "clsx";
import { HiCheck } from "react-icons/hi";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { createScopedKeydownHandler } from "utils/dom/createScopedKeydownHandler";
import { useOnboardingFormContext } from "./OnboardingFormContext";

export function Stepper({ steps, currentStep, setCurrentStep }) {
    const { smAndUp } = useBreakpointsContext();
    const { state } = useOnboardingFormContext();
    const stepStatus = state.stepStatus;

    return (
        <ol
            className={clsx(
                "steps text-center text-xs sm:text-start sm:text-sm",
                smAndUp ? "is-vertical line-space" : "is-horizontal"
            )}
        >
            {steps.map((step, i) => {
                const isDone = stepStatus?.[step.key]?.isDone;
                const isActive = currentStep === i;
                const canClick =
                    isDone || (i === 0 || stepStatus?.[getLeftSiblingKey(i, steps)]?.isDone);

                return (
                    <li
                        key={step.key}
                        className={clsx(
                            "step relative",
                            isDone
                                ? "before:bg-primary-500"
                                : "before:bg-gray-200 dark:before:bg-dark-500",
                            smAndUp && "items-center pb-8"
                        )}
                    >
                        <button
                            type="button"
                            disabled={!canClick}
                            className={clsx(
                                "step-header flex items-center justify-center rounded-full transition-all outline-none",
                                "w-8 h-8 sm:w-9 sm:h-9", // consistent size
                                canClick ? "cursor-pointer" : "cursor-not-allowed",
                                isDone
                                    ? "bg-primary-600 text-white dark:bg-primary-500 dark:text-white"
                                    : isActive
                                        ? "ring-2 ring-primary-500 bg-white text-gray-900 dark:bg-dark-600 dark:text-white dark:ring-primary-400"
                                        : "bg-gray-200 text-gray-900 dark:bg-dark-500 dark:text-dark-100"
                            )}
                            onClick={() => canClick && currentStep !== i && setCurrentStep(i)}
                            onKeyDown={createScopedKeydownHandler({
                                siblingSelector: ".step-header",
                                parentSelector: ".steps",
                                loop: false,
                                orientation: smAndUp ? "vertical" : "horizontal",
                                activateOnFocus: true,
                            })}
                        >
                            {isDone ? <HiCheck className="w-4.5 h-4.5" /> : i + 1}
                        </button>

                        <h3
                            className={clsx(
                                "mt-2 text-gray-800 dark:text-dark-100 sm:text-start",
                                smAndUp && "ltr:ml-4 rtl:mr-4"
                            )}
                        >
                            {step.label}
                        </h3>
                    </li>
                );
            })}
        </ol>
    );
}

// Helper to get the key of the previous step
function getLeftSiblingKey(index, steps) {
    return index > 0 ? steps[index - 1]?.key : undefined;
}

Stepper.propTypes = {
    steps: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            component: PropTypes.elementType.isRequired,
        })
    ).isRequired,
    currentStep: PropTypes.number.isRequired,
    setCurrentStep: PropTypes.func.isRequired,
};
