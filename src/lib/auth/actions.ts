"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isPortalServiceType, type PortalTheme } from "@/lib/auth/service-type";

export type AuthActionResult = {
  error?: string;
  success?: string;
};

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] || "",
    last_name: parts.slice(1).join(" ") || "",
    name: fullName.trim(),
  };
}

export async function signInAction(
  _prev: AuthActionResult | undefined,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prev: AuthActionResult | undefined,
  formData: FormData,
): Promise<AuthActionResult> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const serviceRaw = String(formData.get("serviceType") || "iep");

  if (!fullName || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  if (!isPortalServiceType(serviceRaw)) {
    return { error: "Choose IEP Services or Coaching." };
  }

  const serviceType = serviceRaw as PortalTheme;
  const names = splitName(fullName);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: names.name,
        full_name: names.name,
        service_type: serviceType,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  const userId = data.user?.id;
  if (userId) {
    const admin = createAdminClient();
    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        email,
        name: names.name,
        first_name: names.first_name || null,
        last_name: names.last_name || null,
        service_type: serviceType,
        account_status: "active",
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return { error: `Account created, but profile setup failed: ${profileError.message}` };
    }
  }

  if (!data.session) {
    return {
      success: "Account created. Check your email to confirm, then sign in.",
    };
  }

  redirect("/setup");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
