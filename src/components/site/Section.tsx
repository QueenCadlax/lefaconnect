import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[84rem] px-6 md:px-10 xl:px-14", className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  tone = "ivory",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "ivory" | "white" | "navy" | "muted";
  id?: string;
}) {
  const tones = {
    ivory: "bg-background text-foreground",
    white: "bg-card text-foreground",
    muted: "bg-muted text-foreground",
    navy: "bg-navy text-on-navy",
  } as const;

  return (
    <section id={id} className={cn("py-20 md:py-28 lg:py-32", tones[tone], className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "dark",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "eyebrow mb-5",
            light ? "text-[var(--gold)]" : "text-heritage",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-display text-[2rem] leading-[1.12] md:text-[2.75rem] lg:text-[3.15rem]",
          light ? "text-on-navy" : "text-navy",
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={cn(
            "mt-6 text-base leading-relaxed md:text-lg",
            light ? "text-on-navy-muted" : "text-muted-foreground",
          )}
        >
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="ml-2 inline-flex items-center border border-[var(--gold)]/50 px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.16em] text-[color-mix(in_oklab,var(--gold)_70%,var(--charcoal))] uppercase">
      {children}
    </span>
  );
}
