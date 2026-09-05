import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LefaButton, LefaLink } from "@/components/ui/lefa-button";
import { Field, TextInput } from "@/components/forms/fields";
import { getMemberDashboard } from "@/lib/application.server";
import { privateSeoHead } from "@/lib/seo";

const title = "Member Login — LEFA CONNECT";
const description =
  "Sign in to the secure Lefa Connect member platform for membership, contributions and livestock records.";

export const Route = createFileRoute("/login")({
  head: () => privateSeoHead(title),
  component: LoginPage,
});

function LoginPage() {
  const [registering, setRegistering] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Connecting securely…");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? email.split("@")[0] ?? "Applicant");
    const endpoint = registering ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(registering ? { name, email, password } : { email, password }),
    });
    if (!response.ok) {
      setStatus("We could not complete that request. Check your details and try again.");
      return;
    }
    const sessionResponse = await fetch("/api/auth/get-session", {
      credentials: "include",
    });
    const session = sessionResponse.ok
      ? ((await sessionResponse.json()) as { user?: { status?: string } })
      : null;
    if (session?.user?.status === "admin") {
      window.location.href = "/admin";
      return;
    }
    try {
      await getMemberDashboard();
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/applicant";
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#173f36] lg:block">
        <video
          src="/lvh0.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#173f36]/75" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo tone="light" />
          <div>
            <h2 className="max-w-sm font-display text-4xl leading-tight text-on-navy">
              A connected place to continue your Lefa journey.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-on-navy-muted">
              Access your membership record, contributions, documents and next steps.
            </p>
            <p className="mt-8 flex items-center gap-2 text-xs tracking-[0.14em] text-on-navy-muted uppercase">
              <ShieldCheck className="h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
              Secure access
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-16 md:px-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-10 font-display text-3xl text-navy md:text-4xl lg:mt-0">
            {registering ? "Create your Lefa Connect account" : "Welcome back to Lefa Connect"}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Enter your member credentials to access your account, records and operational dashboard.
          </p>

          <form className="mt-10 space-y-6" onSubmit={submit} aria-describedby="login-status">
            {registering ? (
              <Field id="login-name" label="Full name" required>
                <TextInput id="login-name" name="name" required autoComplete="name" />
              </Field>
            ) : null}
            <Field id="login-email" label="Email">
              <TextInput
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </Field>
            <Field id="login-password" label="Password">
              <TextInput
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </Field>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 accent-[var(--heritage)]"
                />
                Remember me
              </label>
              <Link
                to="/contact"
                className="text-sm text-digital underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <LefaButton type="submit" variant="navy" size="lg" className="w-full">
              {registering ? "Create account" : "Login"}
            </LefaButton>
            <p id="login-status" className="text-xs text-muted-foreground">
              {status || "Your account gives you a private place to continue your application."}
            </p>
          </form>

          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
            <button
              type="button"
              onClick={() => setRegistering((current) => !current)}
              className="flex-1 border border-input px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-navy"
            >
              {registering ? "I already have an account" : "Create an account"}
            </button>
            <LefaLink to="/" variant="link" size="sm" className="flex-1">
              Return to website
            </LefaLink>
          </div>
        </div>
      </div>
    </main>
  );
}
