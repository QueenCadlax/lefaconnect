import type { ReactNode } from "react";
import { Container } from "./Section";
import { Reveal } from "./Reveal";

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy py-20 md:py-28">
      {image ? (
        <>
          <img
            src={image}
            alt={imageAlt ?? ""}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            loading="lazy"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40"
          />
        </>
      ) : null}
      <Container className="relative">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-[var(--gold)]">{eyebrow}</p>
          <h1 className="mt-5 font-display text-[2.2rem] leading-[1.08] text-on-navy md:text-[2.8rem] lg:text-[3.2rem]">
            {title}
          </h1>
          {intro ? (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-navy-muted md:text-lg">
              {intro}
            </p>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
