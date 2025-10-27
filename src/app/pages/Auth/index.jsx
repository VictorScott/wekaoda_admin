import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import {Link, useNavigate} from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import Logo from "assets/WekaOda.svg?react";
import {Button, Card, Checkbox, GhostSpinner, Input, InputErrorMsg} from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { Page } from "components/shared/Page";
import { REDIRECT_URL_KEY } from "constants/app.constant";

export default function Login() {

  const { login, errorMessage, isLoading } = useAuthContext();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const schema = Yup.object().shape({
    username: Yup.string().trim().required("Email is required"),
    password: Yup.string().trim().required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const { otpToken } = await login({
        email: data.username,
        password: data.password,
      });

      navigate("/otp-verification", {
        state: {
          email: data.username,
          otp_token: otpToken,
          redirectTo: new URLSearchParams(location.search).get(REDIRECT_URL_KEY) || null,
        },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      toast.error(msg);
    }
  };

  return (
      <Page title="Login">
        <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
          <div className="w-full max-w-[26rem] p-4 sm:px-5">
            <div className="text-center">
              <Logo className="mx-auto size-16" />
              <div className="mt-4">
                <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                  Welcome Back
                </h2>
                <p className="text-gray-400 dark:text-dark-300">
                  Please login to continue
                </p>
              </div>
            </div>

            <Card className="mt-5 rounded-lg p-5 lg:p-7">
              <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <div className="space-y-4">
                  <Input
                      label="Email"
                      placeholder="Enter your email"
                      prefix={<EnvelopeIcon className="size-5" />}
                      {...register("username")}
                      error={errors?.username?.message}
                  />

                  <Input
                      label="Password"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      prefix={<LockClosedIcon className="size-5" />}
                      suffix={
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            tabIndex={-1}
                        >
                          {showPassword ? (
                              <EyeSlashIcon className="size-5" />
                          ) : (
                              <EyeIcon className="size-5" />
                          )}
                        </button>
                      }
                      {...register("password")}
                      error={errors?.password?.message}
                  />
                </div>

                <div className="mt-2">
                  <InputErrorMsg when={!!errorMessage}>
                    {errorMessage}
                  </InputErrorMsg>
                </div>

                <div className="mt-4 flex items-center justify-between space-x-2">
                  <Checkbox label="Remember me" />
                  <Link
                      to="/forgot-password"
                      className="text-xs text-gray-400 transition-colors hover:text-gray-800 focus:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 dark:focus:text-dark-100"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                    color="primary"
                    className="mt-5 h-10 w-full"
                    type="submit"
                    disabled={isLoading}
                >
                  {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <GhostSpinner className="size-5 border-2" />
                        Logging in...
                      </div>
                  ) : (
                      "Login"
                  )}
                </Button>

              </form>
            </Card>
          </div>
        </main>
      </Page>
  );
}
