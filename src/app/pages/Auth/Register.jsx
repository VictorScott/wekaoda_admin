// Import Dependencies
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// Local Imports
import { Button, Card, Checkbox, Input } from "components/ui";
import Logo from "assets/WekaOda.svg?react";
import {Link} from "react-router";
import {Page} from "../../../components/shared/Page.jsx";

// ----------------------------------------------------------------------

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    // TODO: Handle form validation or API call here

    // Navigate to OTP verification screen
    navigate("/otp-verification");
  };

  return (
      <Page title="Register">
        <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
          <div className="w-full max-w-[26rem] p-4 sm:px-5">
            <div className="text-center">
              <Logo className="mx-auto size-16" />
              <div className="mt-4">
                <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                  Welcome To WekaOda
                </h2>
                <p className="text-gray-400 dark:text-dark-300">
                  Please register to continue
                </p>
              </div>
            </div>
            <Card className="mt-5 rounded-lg p-5 lg:p-7">
              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <Input
                      placeholder="Email"
                      prefix={
                        <EnvelopeIcon
                            className="size-5 transition-colors duration-200"
                            strokeWidth="1"
                        />
                      }
                  />
                  <div className="flex gap-1">
                    <Checkbox label="I agree with" />
                    <a
                        href="#"
                        className="text-gray-400 transition-colors hover:text-gray-800 focus:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 dark:focus:text-dark-100"
                    >
                      privacy policy
                    </a>
                  </div>
                </div>

                <Button type="submit" className="mt-5 w-full" color="primary">
                  Register
                </Button>
              </form>
              <div className="mt-4 text-center text-xs-plus">
                <p className="line-clamp-1">
                  <span>Already have an account? </span>{" "}
                  <Link
                      to="/login"
                      className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
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
