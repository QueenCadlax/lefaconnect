import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LefaLink } from "@/components/ui/lefa-button";
import { Container } from "./Section";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Member Dashboard" },
  { to: "/about", label: "About" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/livestock-projects", label: "Livestock & Projects" },
  { to: "/operations", label: "Operations" },
  { to: "/membership", label: "Membership" },
  { to: "/contact", label: "Contact" },
] as const;

const HEADER_NAV_LINKS = [
  { to: "/about", label: "About" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/membership", label: "Membership" },
  { to: "/operations", label: "Operations" },
  { to: "/livestock-projects", label: "Livestock & Projects" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    void fetch("/api/auth/get-session", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((session: { user?: unknown } | null) => setAuthenticated(Boolean(session?.user)))
      .catch(() => setAuthenticated(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    window.location.href = "/login";
  };

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
          : "border-b border-[color-mix(in_oklab,var(--on-navy)_14%,transparent)] bg-[color-mix(in_oklab,var(--navy)_38%,transparent)] backdrop-blur-md",
      )}
    >
      <Container className="flex h-20 items-center justify-between gap-4 whitespace-nowrap">
        <Logo
          tone="light"
          className="shrink-0 gap-2 [&>img]:h-9 [&>img]:w-12 sm:[&>img]:h-10 sm:[&>img]:w-14"
        />

        <nav aria-label="Primary" className="hidden items-center gap-3 lg:flex xl:gap-4">
          {HEADER_NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ "data-active": "true" }}
              className="relative text-[0.58rem] font-medium tracking-[0.06em] text-on-navy-muted uppercase transition-all duration-300 hover:text-on-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent after:absolute after:-bottom-3 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--gold)] after:transition-all after:duration-300 hover:after:w-full data-[active=true]:text-on-navy data-[active=true]:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {authenticated ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="h-9 px-2 text-[0.62rem] font-semibold tracking-[0.08em] text-on-navy-muted uppercase hover:text-on-navy"
            >
              Logout
            </button>
          ) : (
            <LefaLink
              to="/login"
              variant="ghostLight"
              size="sm"
              className="h-9 px-2 text-[0.62rem] tracking-[0.08em] text-on-navy-muted hover:text-on-navy"
            >
              Login
            </LefaLink>
          )}
          <div className="h-5 w-px bg-[color-mix(in_oklab,var(--on-navy)_15%,transparent)]" />
          <LefaLink
            to="/apply"
            variant="ivory"
            size="sm"
            className="h-9 px-3 text-[0.62rem] tracking-[0.08em]"
          >
            Become a Member
          </LefaLink>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative z-[70] flex h-11 w-11 items-center justify-center border border-[color-mix(in_oklab,var(--on-navy)_25%,transparent)] text-on-navy lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open ? (
        <div className="fixed inset-x-0 top-20 bottom-0 z-[60] h-[calc(100dvh-5rem)] overflow-y-auto bg-navy lg:hidden">
          <Container className="flex flex-col py-8">
            <nav aria-label="Mobile" className="flex flex-col">
              {HEADER_NAV_LINKS.map((link) => (
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
              <LefaLink to="/apply" variant="ivory" size="lg" onClick={() => setOpen(false)}>
                Become a Member
              </LefaLink>
              {authenticated ? (
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="border border-[color-mix(in_oklab,var(--on-navy)_25%,transparent)] px-4 py-3 text-left text-sm font-semibold text-on-navy uppercase"
                >
                  Logout
                </button>
              ) : (
                <LefaLink to="/login" variant="ghostLight" size="lg" onClick={() => setOpen(false)}>
                  Login
                </LefaLink>
              )}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
