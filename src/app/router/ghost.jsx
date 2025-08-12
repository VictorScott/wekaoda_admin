import GhostGuard from "middleware/GhostGuard";

const ghostRoutes = {
  id: "ghost",
  Component: GhostGuard,
  children: [
    {
      path: "login",
      lazy: async () => ({
        Component: (await import("app/pages/Auth/index.jsx")).default,
      }),
    },
    {
      path: "otp-verification",
      lazy: async () => ({
        Component: (await import("app/pages/Auth/OtpVerification.jsx")).default,
      }),
    },
    {
      path: "forgot-password",
      lazy: async () => ({
        Component: (await import("app/pages/Auth/ForgotPassword.jsx")).default,
      }),
    },
    {
      path: "reset-password",
      lazy: async () => ({
        Component: (await import("app/pages/Auth/ResetPassword.jsx")).default,
      }),
    },
  ],
};

export { ghostRoutes };
