import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const lefaButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[0.72rem] font-semibold uppercase tracking-[0.17em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-heritage text-on-navy shadow-[0_10px_30px_-16px_rgba(14,31,26,0.7)] hover:-translate-y-0.5 hover:bg-[var(--heritage-soft)]",
        ivory:
          "bg-[var(--ivory)] text-navy shadow-[0_10px_30px_-16px_rgba(14,31,26,0.7)] hover:-translate-y-0.5 hover:bg-white",
        navy: "bg-navy text-on-navy hover:bg-[var(--navy-soft)]",
        digital: "bg-digital text-on-navy hover:brightness-110",
        outline:
          "border border-[color-mix(in_oklab,var(--navy)_20%,transparent)] text-navy hover:border-navy hover:bg-navy hover:text-on-navy",
        ghostLight:
          "border border-[color-mix(in_oklab,var(--on-navy)_35%,transparent)] text-on-navy hover:bg-[color-mix(in_oklab,var(--on-navy)_12%,transparent)]",
        link: "text-heritage underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-10 px-5",
        md: "h-12 px-7",
        lg: "h-14 px-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof lefaButtonVariants>;

export function LefaButton({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & Variants) {
  return <button className={cn(lefaButtonVariants({ variant, size }), className)} {...props} />;
}

export function LefaLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & Variants) {
  return <Link className={cn(lefaButtonVariants({ variant, size }), className)} {...props} />;
}
