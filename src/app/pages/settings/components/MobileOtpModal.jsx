import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Button, GhostSpinner } from "components/ui";
import { verifyMobileOtp, resendMobileOtp, clearErrors, clearSuccessStates } from "store/slices/profileSlice";

export function MobileOtpModal({ open, onClose, mobileData }) {
    const dispatch = useDispatch();
    const { 
        verifyingOtp, 
        resendingOtp, 
        mobileOtpError, 
        mobileVerifiedSuccess,
        otpSentSuccess 
    } = useSelector((state) => state.profile);

    const [digits, setDigits] = useState(["", "", "", "", ""]);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputsRef = useRef([]);

    // Countdown for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Handle success states
    useEffect(() => {
        if (mobileVerifiedSuccess) {
            toast.success("Mobile number verified successfully!");
            dispatch(clearSuccessStates());
            onClose(true); // Pass true to indicate success
        }
        if (otpSentSuccess && resendCooldown === 0) {
            toast.success("OTP sent successfully!");
            setResendCooldown(60); // 60 second cooldown
            dispatch(clearSuccessStates());
        }
    }, [mobileVerifiedSuccess, otpSentSuccess, dispatch, onClose, resendCooldown]);

    // Handle error states
    useEffect(() => {
        if (mobileOtpError) {
            toast.error(mobileOtpError);
            dispatch(clearErrors());
        }
    }, [mobileOtpError, dispatch]);

    const handleInputChange = (index, value, e) => {
        if (e.type === "paste") {
            const paste = e.clipboardData.getData("text").slice(0, 5).split("");
            const newDigits = [...digits];
            paste.forEach((char, i) => {
                if (i < 5 && /^\d$/.test(char)) {
                    newDigits[i] = char;
                }
            });
            setDigits(newDigits);
            
            // Focus on the next empty input or the last one
            const nextEmptyIndex = newDigits.findIndex(d => d === "");
            const focusIndex = nextEmptyIndex === -1 ? 4 : nextEmptyIndex;
            inputsRef.current[focusIndex]?.focus();
            return;
        }

        if (!/^\d$/.test(value) && value !== "") return;

        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);

        // Auto-focus next input
        if (value && index < 4) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < 4) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleSubmit = () => {
        const otp = digits.join("");
        if (otp.length !== 5) {
            toast.error("Please enter the complete 5-digit OTP");
            return;
        }

        dispatch(verifyMobileOtp({
            ...mobileData,
            otp
        }));
    };

    const handleResend = () => {
        if (resendCooldown > 0) return;
        
        dispatch(resendMobileOtp(mobileData));
    };

    const handleClose = () => {
        setDigits(["", "", "", "", ""]);
        setResendCooldown(0);
        dispatch(clearErrors());
        dispatch(clearSuccessStates());
        onClose(false);
    };

    const isComplete = digits.every(digit => digit !== "");
    const fullMobileNumber = `${mobileData?.mobile_country_code}${mobileData?.mobile_number}`;

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
                onClose={handleClose}
            >
                {/* Backdrop with blur */}
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

                {/* Modal panel with scale + fade */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel className="relative w-full max-w-md bg-white rounded-lg dark:bg-dark-700">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between bg-gray-200 px-4 py-3 rounded-t-lg dark:bg-dark-800">
                            <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                                Verify Mobile Number
                            </DialogTitle>
                            <button
                                onClick={handleClose}
                                className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:text-dark-300 dark:hover:text-dark-100"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-600 dark:text-dark-200 mb-2">
                                    We&apos;ve sent a 5-digit verification code to
                                </p>
                                <p className="font-semibold text-gray-800 dark:text-dark-100">
                                    {fullMobileNumber}
                                </p>
                            </div>

                            {/* OTP Input */}
                            <div className="flex justify-center space-x-3 mb-6">
                                {digits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputsRef.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleInputChange(index, e.target.value, e)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={(e) => handleInputChange(index, "", e)}
                                        className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-600 dark:text-dark-100"
                                        disabled={verifyingOtp}
                                    />
                                ))}
                            </div>

                            {/* Resend OTP */}
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-600 dark:text-dark-200 mb-2">
                                    Didn&apos;t receive the code?
                                </p>
                                <button
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0 || resendingOtp}
                                    className="text-primary-600 hover:text-primary-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    {resendingOtp ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <GhostSpinner className="size-4" />
                                            Sending...
                                        </span>
                                    ) : resendCooldown > 0 ? (
                                        `Resend in ${resendCooldown}s`
                                    ) : (
                                        "Resend OTP"
                                    )}
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <Button
                                    onClick={handleClose}
                                    variant="outlined"
                                    className="flex-1"
                                    disabled={verifyingOtp}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    color="primary"
                                    className="flex-1"
                                    disabled={!isComplete || verifyingOtp}
                                >
                                    {verifyingOtp ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <GhostSpinner className="size-4" />
                                            Verifying...
                                        </span>
                                    ) : (
                                        "Verify"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

MobileOtpModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    mobileData: PropTypes.shape({
        mobile_country_code: PropTypes.string.isRequired,
        mobile_number: PropTypes.string.isRequired,
    }),
};