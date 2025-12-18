import { OnboardingProvider } from "@vritti/quantum-ui";
import type { RouteObject } from "react-router-dom";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthLayout } from "./components/layouts/AuthLayout";
import './index.css';
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { SignupSuccessPage } from "./pages/auth/SignupSuccessPage";
import { MFASetupFlowPage } from "./pages/onboarding/MFASetupFlowPage";
import { OAuthErrorPage } from "./pages/onboarding/OAuthErrorPage";
import { OAuthSuccessPage } from "./pages/onboarding/OAuthSuccessPage";
import { SetPasswordPage } from "./pages/onboarding/SetPasswordPage";
import { VerifyEmailPage } from "./pages/onboarding/VerifyEmailPage";
import { VerifyMobileFlowPage } from "./pages/onboarding/VerifyMobileFlowPage";
import { VerifyOTPPage } from "./pages/onboarding/VerifyOTPPage";

/**
 * Auth routes configuration - exported for Module Federation consumption
 * This is used by the host application to merge auth routes
 */
export const authRoutes: RouteObject[] = [
	{
		path: "/",
		element: <AuthLayout />,
		children: [
			{
				index: true,
				element: <Navigate to="/login" replace />,
			},
			{
				path: "login",
				element: <LoginPage />,
			},
			{
				path: "signup",
				element: <SignupPage />,
			},
			{
				path: "signup-success",
				element: <SignupSuccessPage />,
			},
			{
				path: "forgot-password",
				element: <ForgotPasswordPage />,
			},
			{
				path: "onboarding",
				element: (
					<OnboardingProvider>
						<Outlet />
					</OnboardingProvider>
				),
				children: [
					{
						path: "oauth-success",
						element: <OAuthSuccessPage />,
					},
					{
						path: "oauth-error",
						element: <OAuthErrorPage />,
					},
					{
						path: "verify-email",
						element: <VerifyEmailPage />,
					},
					{
						path: "verify-mobile",
						element: <VerifyMobileFlowPage />,
					},
					{
						path: "verify-otp",
						element: <VerifyOTPPage />,
					},
					{
						path: "set-password",
						element: <SetPasswordPage />,
					},
					{
						path: "mfa-setup",
						element: <MFASetupFlowPage />,
					},
				],
			},
		],
	},
];

/**
 * Browser router instance for standalone auth app
 * Used when running vritti-auth independently
 */
export const router = createBrowserRouter(authRoutes);
