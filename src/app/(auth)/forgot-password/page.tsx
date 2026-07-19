import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthHeader } from "@/components/auth/auth-header";
import { ForgotPasswordSection } from "@/components/auth/forgot-password-section";

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader />
      <main className="flex flex-grow items-center justify-center px-4 py-10 sm:px-6 sm:py-12 lg:py-24">
        <ForgotPasswordSection />
      </main>
      <AuthFooter />
    </>
  );
}
