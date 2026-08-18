import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
  withTagline?: boolean;
};

/**
 * LEFA CONNECT wordmark. Replace the mark with the supplied official
 * logo asset when it is provided by the client.
 */
export function Logo({ tone = "dark", className, withTagline = false }: LogoProps) {
  const isLight = tone === "light";

  return (
    <Link
      to="/"
      aria-label="LEFA CONNECT — home"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <img
        src="/LC.png"
        alt="LEFA CONNECT"
        className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.05rem] tracking-[0.16em] whitespace-nowrap uppercase",
            isLight ? "text-on-navy" : "text-navy",
          )}
        >
          LEFA <span className="text-heritage">CONNECT</span>
        </span>
        {withTagline ? (
          <span
            className={cn(
              "mt-2 text-[0.68rem] tracking-[0.18em] uppercase",
              isLight ? "text-on-navy-muted" : "text-muted-foreground",
            )}
          >
            Heritage. Livelihood. Growth. Connected.
          </span>
        ) : null}
      </span>
    </Link>
  );
}
