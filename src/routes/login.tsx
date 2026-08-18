import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import livestockSplit from "@/assets/livestock-split.jpg";
import { Logo } from "@/components/brand/Logo";
import { LefaButton, LefaLink } from "@/components/ui/lefa-button";
import { Field, TextInput } from "@/components/forms/fields";

const title = "Member Login — LEFA CONNECT";
const description =
  "Sign in to the secure Lefa Connect member platform for membership, contributions and livestock records.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <img
          src={livestockSplit}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          loading="lazy"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/40"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo tone="light" />
          <div>
            <h2 className="max-w-sm font-display text-4xl leading-tight text-on-navy">
              The secure member platform.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-on-navy-muted">
              Membership, contributions, documents and livestock records — one connected
              account across the Lefa Connect ecosystem.
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
            Welcome back to Lefa Connect
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Member sign-in will be enabled when the secure platform is connected.
            Authentication is not active on this page.
          </p>

          <form
            className="mt-10 space-y-6"
            onSubmit={(event) => event.preventDefault()}
            aria-describedby="login-status"
          >
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

            <LefaButton type="submit" variant="navy" size="lg" className="w-full" disabled>
              Login
            </LefaButton>
            <p id="login-status" className="text-xs text-muted-foreground">
              Sign-in is disabled until secure authentication is connected.
            </p>
          </form>

          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
            <LefaLink to="/apply" variant="outline" size="sm" className="flex-1">
              Create an account
            </LefaLink>
            <LefaLink to="/" variant="link" size="sm" className="flex-1">
              Return to website
            </LefaLink>
          </div>
        </div>
      </div>
    </main>
  );
}
