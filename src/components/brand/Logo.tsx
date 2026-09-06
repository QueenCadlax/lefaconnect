import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
  withTagline?: boolean;
  showWordmark?: boolean;
};

export function Logo({
  tone = "dark",
  className,
  withTagline = false,
  showWordmark = true,
}: LogoProps) {
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
        className={cn(
          "h-12 w-16 shrink-0 object-contain object-center sm:h-14 sm:w-[4.25rem]",
          !showWordmark && "h-10 w-14 sm:h-12 sm:w-[3.75rem]",
        )}
      />
      {showWordmark || withTagline ? (
        <span className="flex flex-col leading-none">
          {showWordmark ? (
            <span
              className={cn(
                "font-sans text-[0.88rem] font-bold tracking-[0.14em] whitespace-nowrap uppercase",
                isLight ? "text-on-navy" : "text-navy",
              )}
            >
              LEFA <span className="text-heritage">CONNECT</span>
            </span>
          ) : null}
          {withTagline ? (
            <span
              className={cn(
                showWordmark ? "mt-2" : "mt-0",
                "text-[0.68rem] tracking-[0.18em] uppercase",
                isLight ? "text-on-navy-muted" : "text-muted-foreground",
              )}
            >
              Heritage. Livelihood. Growth. Connected.
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
