import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LefaLink } from "@/components/ui/lefa-button";
import { Container } from "./Section";
import { CONTACT_INFO } from "./data";

const EXPLORE_LINKS = [
  { to: "/about", label: "About" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/membership", label: "Membership" },
  { to: "/operations", label: "Operations" },
  { to: "/livestock-projects", label: "Livestock & Projects" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-navy text-on-navy">
      <Container className="py-16 md:py-20 lg:py-24">
        <div className="grid gap-14 border-b border-[color-mix(in_oklab,var(--on-navy)_12%,transparent)] pb-14 md:gap-16 lg:grid-cols-[1.35fr_0.75fr_1fr] lg:gap-20 lg:pb-18">
          <div className="max-w-md">
            <Logo
              tone="light"
              withTagline
              showWordmark={false}
              className="gap-2 [&>img]:h-9 [&>img]:w-12 sm:[&>img]:h-10 sm:[&>img]:w-14"
            />
            <p className="mt-8 max-w-sm text-sm leading-7 text-on-navy-muted">
              A digital operating platform connecting membership, livestock, records, contributions
              and organisational operations.
            </p>
            <LefaLink
              to="/apply"
              variant="link"
              size="sm"
              className="mt-8 px-0 text-[0.68rem] tracking-[0.16em] text-on-navy hover:text-[var(--gold)]"
            >
              Become a Member
            </LefaLink>
          </div>

          <nav aria-label="Explore" className="lg:justify-self-end">
            <h2 className="eyebrow text-[var(--gold)]">Explore</h2>
            <ul className="mt-7 space-y-4">
              {EXPLORE_LINKS.map((link) => (
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

          <div className="max-w-sm lg:justify-self-end">
            <h2 className="eyebrow text-[var(--gold)]">Connect</h2>
            <ul className="mt-7 space-y-5 text-sm leading-relaxed text-on-navy-muted">
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden="true" />
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="transition-colors hover:text-on-navy"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden="true" />
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-on-navy"
                >
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden="true" />
                <span>{CONTACT_INFO.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-7 text-xs text-on-navy-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Lefa Connect</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Link to="/privacy" className="transition-colors hover:text-on-navy">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="transition-colors hover:text-on-navy">
              Terms of Use
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/cookies" className="transition-colors hover:text-on-navy">
              Cookie Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
