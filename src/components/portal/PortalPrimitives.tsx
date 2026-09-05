import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, CheckCircle2, CircleAlert, Clock3, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";

export function PortalShell({
  children,
  eyebrow,
  title,
  description,
  userName,
  navItems,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  userName?: string;
  navItems: { label: string; href: string; icon: LucideIcon }[];
}) {
  const [signOutError, setSignOutError] = useState(false);

  const signOut = async () => {
    setSignOutError(false);
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Sign out failed.");
      window.location.href = "/login";
    } catch {
      setSignOutError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ed] text-[var(--charcoal)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-[var(--navy)] px-6 py-7 text-on-navy lg:flex">
        <Logo tone="light" className="border-b border-white/10 pb-7" />
        <div className="mt-9">
          <p className="eyebrow text-[var(--gold)]">Your workspace</p>
          {userName ? <p className="mt-3 text-sm text-on-navy-muted">{userName}</p> : null}
        </div>
        <nav className="mt-7 flex flex-1 flex-col gap-1" aria-label="Authenticated navigation">
          {navItems.map(({ label, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="group flex items-center gap-3 border-l-2 border-transparent px-3 py-3 text-sm text-on-navy-muted transition hover:border-[var(--gold)] hover:bg-white/5 hover:text-on-navy"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </a>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-3 text-sm text-on-navy-muted transition hover:text-on-navy"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            Visit Lefa Connect home
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex items-center gap-3 px-3 py-3 text-sm text-on-navy-muted transition hover:text-on-navy"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
          {signOutError ? (
            <p className="px-3 pt-2 text-xs text-red-300">Could not sign out. Please try again.</p>
          ) : null}
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="border-b border-[var(--border)] bg-[#f5f3ed]/90 px-5 py-5 backdrop-blur md:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
            <div>
              <p className="eyebrow text-heritage">{eyebrow}</p>
              <h1 className="mt-2 text-3xl text-navy md:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
            </div>
            <Link
              to="/"
              className="hidden items-center gap-2 border border-input bg-card px-4 py-3 text-xs font-semibold tracking-[0.1em] text-navy uppercase transition hover:border-heritage sm:flex"
            >
              Home <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </header>
        <main className="px-5 py-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const tone =
    normalized.includes("ACTIVE") || normalized.includes("VERIFIED") || normalized === "PAID"
      ? "border-heritage/30 bg-heritage/10 text-heritage"
      : normalized.includes("OVERDUE") ||
          normalized.includes("REJECTED") ||
          normalized.includes("SUSPENDED")
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-amber-200 bg-amber-50 text-amber-900";
  const Icon = tone.includes("red") ? CircleAlert : tone.includes("amber") ? Clock3 : CheckCircle2;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] uppercase ${tone}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function PortalMetric({
  icon: Icon,
  label,
  value,
  detail,
  dark = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  dark?: boolean;
}) {
  return (
    <article
      className={`surface-card p-5 ${dark ? "border-transparent bg-navy text-on-navy hover:border-transparent" : "bg-card"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className={`eyebrow ${dark ? "text-[var(--gold)]" : "text-heritage"}`}>{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center ${dark ? "bg-white/10" : "bg-heritage/10"}`}
        >
          <Icon
            className={`h-4 w-4 ${dark ? "text-[var(--gold)]" : "text-heritage"}`}
            aria-hidden="true"
          />
        </span>
      </div>
      <p className={`mt-6 font-display text-3xl ${dark ? "text-on-navy" : "text-navy"}`}>{value}</p>
      <p className={`mt-2 text-xs ${dark ? "text-on-navy-muted" : "text-muted-foreground"}`}>
        {detail}
      </p>
    </article>
  );
}

export function PortalSection({
  icon: Icon,
  label,
  title,
  action,
  children,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="surface-card bg-card p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-heritage/10">
            <Icon className="h-5 w-5 text-heritage" aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow text-heritage">{label}</p>
            <h2 className="mt-2 text-2xl text-navy">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      <div className="pt-6">{children}</div>
    </section>
  );
}

export function PortalEmptyState({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border border-dashed border-border bg-[#fbfaf7] p-5 text-sm text-muted-foreground">
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-heritage" aria-hidden="true" /> : null}
      <span>{children}</span>
    </div>
  );
}
