import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LefaLink } from "@/components/ui/lefa-button";
import { Container } from "./Section";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/membership", label: "Membership" },
  { to: "/livestock-projects", label: "Livestock & Projects" },
  { to: "/contact", label: "Contact" },
  { to: "/login", label: "Login" },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = !overlay || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-[color-mix(in_oklab,var(--on-navy)_8%,transparent)] bg-[color-mix(in_oklab,var(--navy)_97%,transparent)] backdrop-blur-sm shadow-sm"
          : "bg-transparent",
      )}
    >
      <Container className="flex h-20 items-center justify-between gap-8">
        <Logo tone="light" />

        <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ "data-active": "true" }}
              className="relative text-[0.75rem] font-medium tracking-[0.12em] text-on-navy-muted uppercase transition-all duration-300 hover:text-on-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent after:absolute after:-bottom-3 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--gold)] after:transition-all after:duration-300 hover:after:w-full data-[active=true]:text-on-navy data-[active=true]:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LefaLink to="/login" variant="ghostLight" size="sm">
            Login
          </LefaLink>
          <LefaLink to="/apply" variant="primary" size="sm">
            Become a Member
          </LefaLink>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center border border-[color-mix(in_oklab,var(--on-navy)_25%,transparent)] text-on-navy lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open ? (
        <div className="fixed inset-x-0 top-20 bottom-0 z-50 overflow-y-auto bg-navy lg:hidden">
          <Container className="flex flex-col py-8">
            <nav aria-label="Mobile" className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-[color-mix(in_oklab,var(--on-navy)_10%,transparent)] py-5 font-display text-2xl text-on-navy"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-3">
              <LefaLink to="/apply" variant="primary" size="lg" onClick={() => setOpen(false)}>
                Become a Member
              </LefaLink>
              <LefaLink
                to="/login"
                variant="ghostLight"
                size="lg"
                onClick={() => setOpen(false)}
              >
                Login
              </LefaLink>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
