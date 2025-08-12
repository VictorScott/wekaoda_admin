import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

import { Button, Card, Input, Spinner } from "components/ui";
import Logo from "assets/WekaOda.svg?react";
import { Page } from "components/shared/Page";
import API from "utils/api";
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/24/outline";

export default function ResetPassword() {
    const navigate = useNavigate();

    const [digits, setDigits] = useState(["", "", "", "", ""]);
    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputsRef = useRef([]);
    const location = useLocation();
    const [otpToken, setOtpToken] = useState("");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const state = location.state || {};
        if (!state?.otpToken || !state?.email) {
            toast.error("Missing OTP token or email");
            navigate("/forgot-password");
        } else {
            setOtpToken(state.otpToken);
            setEmail(state.email);
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDigitChange = (index, value, e) => {
        if (e.type === "paste") {
            const pasted = e.clipboardData.getData("text").slice(0, 5).split("");
            const padded = pasted.concat(Array(5 - pasted.length).fill(""));
            setDigits(padded);
            padded.forEach((digit, i) => {
                if (inputsRef.current[i]) inputsRef.current[i].value = digit;
            });
            return;
        }

        if (e.key === "Backspace" && !value && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (/^\d$/.test(value)) {
            const updated = [...digits];
            updated[index] = value;
            setDigits(updated);
            if (index < 4) inputsRef.current[index + 1]?.focus();
        }
    };

    const validate = () => {
        if (!form.password || !form.confirmPassword) {
            setError("Password fields are required.");
            return false;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        if (digits.some((d) => d === "")) {
            setError("Please enter the full OTP.");
            return false;
        }

        setError("");
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);

            const otp = digits.join("");

            const res = await API.post("/auth/reset-password", {
                otp,
                new_password: form.password,
                otp_token: otpToken,
            });

            if (res.data?.success) {
                toast.success("Password reset successful!", { className: "soft-color" });

                navigate("/login");
            } else {
                throw new Error(res.data.message || "Password reset failed");
            }
        } catch (err) {
            console.log(err)
            toast.error(
                err.response?.data?.message || err.message || "Something went wrong.",
                {
                    className: "soft-color",
                }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            await toast.promise(
                API.post("/auth/resend-otp-forgot-password", { email }),
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

    return (
        <Page title="Reset Password">
            <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
                <div className="w-full max-w-[26rem] p-4 sm:px-5">
                    <div className="text-center">
                        <Logo className="mx-auto size-16" />
                        <div className="mt-4">
                            <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                                Reset Your Password
                            </h2>
                            <p className="text-gray-400 dark:text-dark-300">
                                Enter the OTP and set your new password
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
                                        onChange={(e) => handleDigitChange(i, e.target.value, e)}
                                        onKeyDown={(e) => handleDigitChange(i, e.target.value, e)}
                                        onPaste={(e) => handleDigitChange(i, e.target.value, e)}
                                    />
                                ))}
                            </div>

                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="size-5" />
                                        ) : (
                                            <EyeIcon className="size-5" />
                                        )}
                                    </button>
                                }
                            />

                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        tabIndex={-1}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="size-5" />
                                        ) : (
                                            <EyeIcon className="size-5" />
                                        )}
                                    </button>
                                }
                            />

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <Button type="submit" className="w-full mt-2" color="primary" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner color="primary" className="size-5 border-2" />
                                        Updating...
                                    </div>
                                ) : (
                                    "Update Password"
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
                    </Card>
                </div>
            </main>
        </Page>
    );
}
