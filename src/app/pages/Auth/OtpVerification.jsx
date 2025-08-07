// Import Dependencies
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Local Imports
import { Button, Card, Input } from "components/ui";
import Logo from "assets/WekaOda.svg?react";
import { Page } from "components/shared/Page";

// ----------------------------------------------------------------------

export default function OtpVerification() {
    const [digits, setDigits] = useState(["", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputsRef = useRef([]);
    const navigate = useNavigate();

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Handle input change
    const handleInputChange = (index, value, e) => {
        if (e.type === "paste") {
            const paste = e.clipboardData.getData("text").slice(0, 5).split("");
            const newDigits = Array(5).fill("");
            paste.forEach((digit, i) => {
                newDigits[i] = digit;
                if (inputsRef.current[i]) inputsRef.current[i].value = digit;
            });
            setDigits(newDigits);
            return;
        }

        if (e.key === "Backspace") {
            if (!value && index > 0) {
                inputsRef.current[index - 1]?.focus();
            }
        } else if (/^\d$/.test(value)) {
            const newDigits = [...digits];
            newDigits[index] = value;
            setDigits(newDigits);
            if (index < 4) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const otp = digits.join("");

        if (otp.length < 5) {
            setError("Please enter all 5 digits.");
            return;
        }

        try {
            setLoading(true);

            // Simulated API call (replace with real API)
            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.success("OTP verified successfully!", {
                className: "soft-color",
            });

            setLoading(false);

            // ✅ Redirect to registration-info page
            navigate("/registration-info");
        } catch {
            setLoading(false);
            toast.error("Failed to verify OTP", {
                className: "soft-color",
            });
            setError("OTP verification failed. Please try again.");
        }
    };

    // Handle OTP resend
    const handleResend = () => {
        if (resendCooldown > 0) return;

        toast.message("OTP resent!", {
            className: "soft-color",
        });

        setResendCooldown(60); // 60s cooldown
    };

    return (
        <Page title="Verify OTP">
            <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
                <div className="w-full max-w-[26rem] p-4 sm:px-5">
                    <div className="text-center">
                        <Logo className="mx-auto size-16" />
                        <div className="mt-4">
                            <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                                Verify Email
                            </h2>
                            <p className="text-gray-400 dark:text-dark-300">
                                Enter the 5-digit code sent to your email
                            </p>
                        </div>
                    </div>

                    <Card className="mt-5 rounded-lg p-5 lg:p-7">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex justify-between gap-2">
                                {digits.map((digit, i) => (
                                    <Input
                                        key={i}
                                        type="text"
                                        maxLength={1}
                                        className="text-center text-xl"
                                        ref={(el) => (inputsRef.current[i] = el)}
                                        onChange={(e) =>
                                            handleInputChange(i, e.target.value, e)
                                        }
                                        onKeyDown={(e) =>
                                            handleInputChange(i, e.target.value, e)
                                        }
                                        onPaste={(e) => handleInputChange(i, e.target.value, e)}
                                    />
                                ))}
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <Button
                                type="submit"
                                className="w-full mt-2"
                                color="primary"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Button>

                            <div className="mt-4 text-center text-xs-plus">
                                <p>
                                    Didn&apos;t get the code?{" "}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendCooldown > 0}
                                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600 underline"
                                    >
                                        {resendCooldown > 0
                                            ? `Resend in ${resendCooldown}s`
                                            : "Resend"}
                                    </button>
                                </p>
                            </div>
                        </form>

                        <div className="mt-4 text-center text-xs-plus">
                            <p className="line-clamp-1">
                                <span>Entered wrong email?</span>{" "}
                                <Link
                                    className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                                    to="/register"
                                >
                                    Go back
                                </Link>
                            </p>
                        </div>
                    </Card>
                </div>
            </main>
        </Page>
    );
}
