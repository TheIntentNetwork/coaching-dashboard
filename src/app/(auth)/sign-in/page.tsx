import { AuthFooter } from "@/components/auth/auth-footer";
import { SignInSection } from "@/components/auth/sign-in-section";

export default function SignInPage() {
  return (
    <>
      <main className="flex flex-grow items-center justify-center px-4 py-10 sm:px-6 sm:py-12 md:py-24">
        <SignInSection />
      </main>
      <AuthFooter />
    </>
  );
}
