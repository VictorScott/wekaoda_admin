import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {Button, Card, Input, Spinner} from "components/ui";
import Logo from "assets/WekaOda.svg?react";
import { Page } from "components/shared/Page.jsx";
import API from "../../../utils/api.js";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            const res = await API.post("/auth/forgot-password", { email });

            const otpToken = res.data?.otp_token;

            if (!otpToken) throw new Error("OTP token missing from response");

            toast.success("OTP sent successfully!", { className: "soft-color" });

            navigate("/reset-password", {
                state: {
                    email,
                    otpToken,
                },
            });
        } catch (err) {
            const message =
                err.response?.data?.message || err.message || "Failed to send reset link.";
            toast.error(message, { className: "soft-color" });
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Page title="Forgot Password">
            <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
                <div className="w-full max-w-[26rem] p-4 sm:px-5">
                    <div className="text-center">
                        <Logo className="mx-auto size-16" />
                        <div className="mt-4">
                            <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                                Forgot Your Password?
                            </h2>
                            <p className="text-gray-400 dark:text-dark-300">
                                Enter your email to receive a reset otp.
                            </p>
                        </div>
                    </div>

                    <Card className="mt-5 rounded-lg p-5 lg:p-7">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <Button type="submit" className="w-full mt-2" color="primary" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner color="primary" className="size-5 border-2" />
                                        Sending...
                                    </div>
                                ) : (
                                    "Send Reset OTP"
                                )}
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-xs-plus">
                            <p className="line-clamp-1">
                                <span>Remembered your password?</span>{" "}
                                <Link
                                    className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                                    to="/login"
                                >
                                    Login
                                </Link>
                            </p>
                        </div>
                    </Card>
                </div>
            </main>
        </Page>
    );
}
