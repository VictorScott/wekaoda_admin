import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button, Card, Input, Spinner } from "components/ui";
import Logo from "assets/WekaOda.svg?react";
import { Page } from "components/shared/Page";
import API from "utils/api";
import { useAuthContext } from "app/contexts/auth/context";

export default function OtpVerification() {
    const [digits, setDigits] = useState(["", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const [otpToken, setOtpToken] = useState("");
    const [email, setEmail] = useState("");
    const [redirectTo, setRedirectTo] = useState(null);

    const inputsRef = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp } = useAuthContext();

    useEffect(() => {
        const { otp_token, email, redirectTo } = location.state || {};

        if (!otp_token || !email) {
            toast.error("Missing OTP token or email");
            navigate("/login");
        } else {
            setOtpToken(otp_token);
            setEmail(email);
            setRedirectTo(redirectTo || "/");
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const otp = digits.join("");

        if (otp.length < 5) {
            setError("Please enter all 5 digits.");
            return;
        }

        setLoading(true);

        try {
            await verifyOtp({
                otp,
                type: "user",
                otp_token: otpToken,
            });

            toast.success("Logged in successfully!", { className: "soft-color" });
            navigate(redirectTo || "/");
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Failed to verify OTP.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            await toast.promise(
                API.post("/auth/resend-otp", { email }),
                {
                    loading: "Resending OTP...",
                    success: (res) => {
                        const newToken = res.data?.otp_token;
                        if (newToken) setOtpToken(newToken);
                        setResendCooldown(60);
                        return "OTP resent successfully!";
                    },
                    error: (err) =>
                        err.response?.data?.message || "Failed to resend OTP. Please try again.",
                    className: "soft-color",
                }
            );
        } catch (err) {
            console.error("Resend OTP failed:", err);
        }
    };

    function maskEmail(email) {
        if (!email || !email.includes("@")) return "";

        const [name, domain] = email.split("@");

        if (name.length <= 2) {
            return `${name[0]}***@${domain}`;
        }

        return `${name[0]}***${name.slice(-1)}@${domain}`;
    }

    return (
        <Page title="Verify OTP">
            <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
                <div className="w-full max-w-[26rem] p-4 sm:px-5">
                    <div className="text-center">
                        <Logo className="mx-auto size-16" />
                        <div className="mt-4">
                            <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                                Verify Login
                            </h2>
                            <p className="text-gray-400 dark:text-dark-300">
                                Enter the 5-digit code sent to <strong>{maskEmail(email)}</strong>
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
                                        onChange={(e) => handleInputChange(i, e.target.value, e)}
                                        onKeyDown={(e) => handleInputChange(i, e.target.value, e)}
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
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner color="primary" className="size-5 border-2" />
                                        Verifying...
                                    </div>
                                ) : (
                                    "Verify OTP"
                                )}
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
                                    to="/login"
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
