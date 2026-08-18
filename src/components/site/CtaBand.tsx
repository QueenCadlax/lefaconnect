import { Container } from "./Section";
import { Reveal } from "./Reveal";
import { LefaLink } from "@/components/ui/lefa-button";

export function CtaBand({
  heading = "Ready to connect with Lefa?",
  intro = "Take the next step and become part of the Lefa Connect journey.",
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
        className="absolute inset-0 bg-[color-mix(in_oklab,var(--navy)_78%,transparent)]"
      />
      <Container className="relative py-24 text-center md:py-32">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="font-display text-[2.1rem] leading-tight text-on-navy md:text-[3rem]">
            {heading}
          </h2>
          <p className="mt-5 text-base text-on-navy-muted md:text-lg">{intro}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <LefaLink to="/apply" variant="primary" size="lg">
              Become a Member
            </LefaLink>
            <LefaLink to="/contact" variant="ghostLight" size="lg">
              Contact Us
            </LefaLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
