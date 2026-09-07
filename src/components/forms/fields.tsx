import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full border border-input bg-card px-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus:border-digital focus:outline-none focus:ring-2 focus:ring-ring/25";

export function Field({
  id,
  label,
  hint,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  required?: boolean | undefined;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="text-[0.7rem] font-semibold tracking-[0.14em] text-navy uppercase"
      >
        {label}
        {required ? <span className="ml-1 text-heritage">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlBase, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlBase, "py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(controlBase, "h-12", className)} {...props} />;
}

export function FieldsetBlock({
  legend,
  step,
  children,
}: {
  legend: string;
  step: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-t border-border pt-8">
      <legend className="sr-only">{legend}</legend>
      <div className="mb-7 flex items-baseline gap-4">
        <span className="font-display text-lg text-[var(--gold)]">{step}</span>
        <h2 className="font-display text-2xl text-navy">{legend}</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
