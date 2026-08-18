import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LefaButton } from "@/components/ui/lefa-button";
import { Container, Placeholder } from "./Section";

const FOOTER_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/membership", label: "Membership" },
  { to: "/livestock-projects", label: "Livestock & Projects" },
  { to: "/operations", label: "Operations" },
  { to: "/contact", label: "Contact" },
  { to: "/login", label: "Login" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-navy text-on-navy">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" withTagline />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-on-navy-muted">
              A connected digital foundation for membership, livestock development and
              organisational operations.
            </p>
            <div className="mt-7 rounded border border-[color-mix(in_oklab,var(--on-navy)_15%,transparent)] bg-[color-mix(in_oklab,var(--navy)_80%,transparent)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-on-navy-muted">
              Placeholder channels to confirm
            </div>
          </div>

          <nav aria-label="Footer" className="lg:col-span-3">
            <h2 className="eyebrow text-[var(--gold)]">Navigate</h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-1">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-on-navy-muted transition-colors hover:text-on-navy"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="eyebrow text-[var(--gold)]">Contact</h2>
            <ul className="mt-6 space-y-4 text-sm text-on-navy-muted">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Head office address
                  <Placeholder>To confirm</Placeholder>
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Telephone number
                  <Placeholder>To confirm</Placeholder>
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Email address
                  <Placeholder>To confirm</Placeholder>
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="eyebrow text-[var(--gold)]">Updates</h2>
            <p className="mt-6 text-sm text-on-navy-muted">
              Occasional news from the Lefa Connect ecosystem.
            </p>
            <form
              className="mt-4 flex flex-col gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="you@example.com"
                className="h-11 w-full border border-[color-mix(in_oklab,var(--on-navy)_20%,transparent)] bg-transparent px-3 text-sm text-on-navy placeholder:text-on-navy-muted/70 focus:border-[var(--gold)] focus:outline-none"
              />
              <LefaButton type="submit" variant="ghostLight" size="sm">
                Sign up
              </LefaButton>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[color-mix(in_oklab,var(--on-navy)_12%,transparent)] pt-7 text-xs text-on-navy-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Lefa Connect. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#" className="transition-colors hover:text-on-navy">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-on-navy">
              Terms of Use
            </a>
            <a href="#" className="transition-colors hover:text-on-navy">
              Cookie Policy
            </a>
          </div>
        </div>
        <p className="mt-4 text-right text-[0.62rem] tracking-[0.14em] uppercase text-on-navy-muted">
          Heritage. Livelihood. Growth. Connected.
        </p>
      </Container>
    </footer>
  );
}
