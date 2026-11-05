import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, validateFullName } from "@/lib/customerOtp";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function validatePassword(password) {
  if (password.length < 8) return "Password must contain at least 8 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include an uppercase letter, a lowercase letter, and a number.";
  }
  return "";
}

function isDuplicateUserError(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return code === "email_exists" || message.includes("already registered") || message.includes("already exists");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);
    const fullName = validateFullName(body?.fullName);
    const password = String(body?.password || "");

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (typeof fullName !== "string") {
      return NextResponse.json({ error: fullName }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const { error } = await createAdminClient().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      if (isDuplicateUserError(error)) {
        return NextResponse.json({ error: "An account already exists for this email. Sign in or use Forgot password." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth/password/register] Unable to create account", error);
    return NextResponse.json({ error: "We could not create your account. Please try again." }, { status: 500 });
  }
}
