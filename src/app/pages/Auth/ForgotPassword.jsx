// Import Dependencies
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Local Imports
import { Button, Card, Input } from "components/ui";
import Logo from "assets/WekaOda.svg?react";
import { Page } from "components/shared/Page.jsx";

// ----------------------------------------------------------------------

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); // ✅ Added navigation hook

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            // Simulated API call (replace with real API call)
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // ✅ Store email so it can be used in reset page
            localStorage.setItem("email", email);

            toast.success("OTP sent successfully!", {
                className: "soft-color",
            });

            setLoading(false);

            // ✅ Navigate to reset-password page
            navigate("/reset-password");
        } catch {
            setLoading(false);
            toast.error("Failed to send reset link", {
                className: "soft-color",
            });
            setError("Something went wrong. Please try again.");
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
                                Enter your email to receive a reset link.
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

                            <Button
                                type="submit"
                                className="w-full mt-2"
                                color="primary"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-xs-plus">
                            <p className="line-clamp-1">
                                <span>Remembered your password?</span>{" "}
                                <Link
                                    className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                                    to="/login"
                                >
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                    </Card>
                </div>
            </main>
        </Page>
    );
}
