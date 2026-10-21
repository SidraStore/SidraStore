"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthFrame from "./AuthFrame";

export default function CustomerAuth({ nextPath }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const fullName = String(form.get("fullName") || "").trim();
    const supabase = createClient();

    const result = mode === "register"
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);
    if (result.error) {
      setStatus({ type: "error", message: result.error.message });
      return;
    }

    if (mode === "register" && !result.data.session) {
      setStatus({ type: "success", message: "Account created. Check your email to confirm your account, then sign in." });
      return;
    }

    window.location.assign(nextPath);
  }

  return (
    <AuthFrame
      eyebrow={mode === "register" ? "Join Sidra Store" : "Welcome Back"}
      title={mode === "register" ? "Create your account" : "Log in to Sidra"}
      description={mode === "register" ? "Create an account to save your delivery details and enjoy a faster checkout." : "Track orders, save your delivery address, and checkout faster."}
      footer={(
        <>
          {mode === "login" ? "New to Sidra? " : "Already have an account? "}
          <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setStatus({ type: "", message: "" }); }} className="font-bold text-gold-dark transition hover:text-ink">
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <label className="block">
                <span className="sr-only">Full name</span>
                <span className="flex h-14 items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 shadow-sm transition focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/10">
                  <UserRound size={18} className="text-gold-dark" />
                  <input name="fullName" required autoComplete="name" className="h-full w-full bg-transparent text-sm outline-none placeholder:text-stone-400" placeholder="Full name" />
                </span>
              </label>
            )}
            <label className="block">
              <span className="sr-only">Email address</span>
              <span className="flex h-14 items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 shadow-sm transition focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/10">
                <Mail size={18} className="text-gold-dark" />
                <input name="email" type="email" required autoComplete="email" className="h-full w-full bg-transparent text-sm outline-none placeholder:text-stone-400" placeholder="Email address" />
              </span>
            </label>
            <label className="block">
              <span className="sr-only">Password</span>
              <span className="flex h-14 items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 shadow-sm transition focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/10">
                <LockKeyhole size={18} className="text-gold-dark" />
                <input name="password" type={showPassword ? "text" : "password"} minLength={8} required autoComplete={mode === "register" ? "new-password" : "current-password"} className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400" placeholder={mode === "register" ? "Password (minimum 8 characters)" : "Password"} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="text-stone-400 transition hover:text-gold-dark">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {status.message && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${status.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{status.message}</p>}
            <button disabled={submitting} className="group flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-gold-dark px-6 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_14px_32px_-16px_rgba(168,122,50,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(168,122,50,0.8)] disabled:cursor-not-allowed disabled:opacity-60">
              {!submitting && <LogIn size={18} />}
              {submitting ? "Please wait..." : mode === "register" ? "Create Account" : "Log In"}
            </button>
      </form>
    </AuthFrame>
  );
}
