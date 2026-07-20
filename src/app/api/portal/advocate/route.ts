import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import { getProfileEmail } from "@/lib/portal/server/profile";
import { getAdvocateForUser } from "@/lib/portal/server/advisor";
import { decryptField, isEncryptedField } from "@/lib/encryption";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;
  const { user } = auth;

  const email = await getProfileEmail(supabase, user.id);
  const advocate = await getAdvocateForUser(user.id, email);

  if (!advocate) {
    return NextResponse.json({ advocate: null });
  }

  let phone = advocate.phone;
  if (isEncryptedField(phone)) {
    phone = decryptField(phone);
  }

  return NextResponse.json({
    advocate: {
      ...advocate,
      phone,
    },
  });
}
