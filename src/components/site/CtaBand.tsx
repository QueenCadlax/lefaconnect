import { Container } from "./Section";
import { Reveal } from "./Reveal";
import { LefaLink } from "@/components/ui/lefa-button";

export function CtaBand({
  heading = "Your place in the Lefa ecosystem starts here.",
  intro = "Apply to become part of Lefa Connect and establish your membership within a structured organisation built around participation, livestock development, operational coordination and long-term growth.",
}: {
  heading?: string;
  intro?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <video
        src="/lv2.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[color-mix(in_oklab,#173f36_78%,transparent)]"
      />
      <Container className="relative py-24 text-center md:py-32">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="font-display text-[2rem] leading-tight text-on-navy md:text-[2.55rem]">
            {heading}
          </h2>
          <p className="mt-5 text-base text-on-navy-muted md:text-lg">{intro}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <LefaLink to="/apply" variant="ivory" size="lg">
              Become a Member
            </LefaLink>
            <LefaLink to="/contact" variant="ghostLight" size="lg">
              Contact Lefa Connect
            </LefaLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
