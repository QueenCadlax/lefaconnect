import {
  ArrowRight,
  Boxes,
  FileText,
  Landmark,
  Leaf,
  LineChart,
  Users,
  Wallet,
} from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaLink } from "@/components/ui/lefa-button";
import {
  ECOSYSTEM_CARDS,
  ECOSYSTEM_STRIP,
  FUTURE_PILLARS,
  HOW_IT_WORKS,
} from "@/components/site/data";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100vh] items-center overflow-hidden">
      <img
        src="/LC LX.png"
        alt="Lefa Connect"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_oklab,var(--navy)_95%,transparent)] via-[color-mix(in_oklab,var(--navy)_70%,transparent)] to-[color-mix(in_oklab,var(--navy)_20%,transparent)]"
      />
      <Container className="relative py-20 md:py-28 lg:py-32">
        <Reveal className="max-w-4xl">
          <p className="eyebrow text-[0.75rem] tracking-widest text-[var(--gold)] uppercase font-medium">Lefa Connect</p>
          <h1 className="mt-8 font-display text-[2.2rem] leading-[1.2] text-on-navy sm:text-[3rem] lg:text-[3.8rem]">
            Heritage. Livelihood.
            <br className="hidden sm:block" /> Growth. Connected.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-on-navy font-light">
            Building connected pathways to sustainable livelihoods, livestock development
            and shared growth.
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-on-navy-muted tracking-wide">
            Lefa Connect brings membership, contributions, livestock and organisational
            operations together through one connected digital platform.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <LefaLink to="/apply" variant="primary" size="lg">
              Become a Member
            </LefaLink>
            <LefaLink to="/about" variant="ghostLight" size="lg">
              Explore Lefa Connect
            </LefaLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

const STRIP_ICONS = [Users, Leaf, Wallet, Boxes, LineChart];

export function EcosystemStrip() {
  return (
    <section className="border-b border-[color-mix(in_oklab,var(--on-navy)_5%,transparent)] bg-card">
      <Container>
        <ul className="grid grid-cols-1 divide-y divide-[color-mix(in_oklab,var(--on-navy)_5%,transparent)] sm:grid-cols-2 sm:divide-x lg:grid-cols-5 lg:divide-y-0">
          {ECOSYSTEM_STRIP.map((item, index) => {
            const Icon = STRIP_ICONS[index]!;
            return (
              <Reveal
                as="li"
                key={item.label}
                delay={index * 70}
                className="px-3 py-12 first:pl-0 sm:px-8 lg:px-7"
              >
                <Icon className="h-6 w-6 text-heritage" aria-hidden="true" />
                <p className="eyebrow mt-5 text-[0.7rem] tracking-wider text-navy font-semibold">{item.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.phrase}</p>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

export function AboutPreview() {
  return (
    <Section tone="ivory">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="Who we are"
            title="More than a platform. A connected ecosystem."
            intro="Lefa Connect brings people, livestock and organisational resources together through digital innovation and strong governance. The platform is designed to support members, streamline operations and create connected pathways for sustainable growth."
          />
          <Reveal delay={120} className="mt-6">
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Built as the digital foundation for a modern African enterprise, Lefa Connect
              serves as a central hub for organisational activity, from member management to
              livestock operations and beyond.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-9">
            <LefaLink to="/about" variant="outline">
              Learn More About Us
            </LefaLink>
          </Reveal>
        </div>
        <Reveal delay={100} className="relative">
          <div
            aria-hidden="true"
            className="absolute -top-5 -left-5 hidden h-40 w-40 border-t border-l border-[var(--gold)]/50 lg:block"
          />
          <video
            src="/lh x lc.mp4"
            autoPlay
            muted
            loop
            playsInline
            loading="lazy"
            className="relative aspect-[4/5] w-full object-cover"
          />
        </Reveal>
      </Container>
    </Section>
  );
}

export function HowItWorks() {
  return (
    <Section tone="white" className="border-y border-[color-mix(in_oklab,var(--on-navy)_3%,transparent)]">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Four steps into the Lefa ecosystem."
        />
        <ol className="relative mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div
            aria-hidden="true"
            className="absolute top-6 right-0 left-0 hidden h-px bg-[color-mix(in_oklab,var(--on-navy)_8%,transparent)] lg:block"
          />
          {HOW_IT_WORKS.map((item, index) => (
            <Reveal as="li" key={item.step} delay={index * 90} className="relative">
              <span
                aria-hidden="true"
                className="absolute -top-[0.4rem] left-0 hidden h-2 w-2 rounded-full bg-[var(--gold)] lg:block"
              />
              <p className="font-display text-4xl font-light text-[var(--gold)] lg:mt-10">
                {item.step}
              </p>
              <h3 className="mt-5 font-display text-xl leading-snug text-navy">{item.title}</h3>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {item.copy}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

const CARD_ICONS = [Users, Wallet, FileText, Leaf, Boxes, Landmark];

export function EcosystemCards() {
  return (
    <Section tone="ivory">
      <Container>
        <SectionHeading
          eyebrow="The ecosystem"
          title="One platform. Six connected domains."
          intro="Each area of Lefa Connect is being built to work as part of a single, governed system."
        />
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ECOSYSTEM_CARDS.map((card, index) => {
            const Icon = CARD_ICONS[index]!;
            return (
              <Reveal
                as="article"
                key={card.title}
                delay={(index % 3) * 80}
                className="group relative bg-white border border-[color-mix(in_oklab,var(--on-navy)_6%,transparent)] p-10 transition-all duration-300 hover:border-[color-mix(in_oklab,var(--heritage)_40%,transparent)] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon className="h-6 w-6 text-heritage flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="eyebrow text-[0.65rem] tracking-[0.2em] text-[var(--gold)] font-medium">
                    {card.id}
                  </span>
                </div>
                <h3 className="mt-7 font-display text-xl leading-snug text-navy">{card.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {card.copy}
                </p>
                <LefaLink
                  to="/how-it-works"
                  variant="link"
                  size="sm"
                  className="mt-8 h-auto px-0 inline-flex items-center text-heritage hover:text-navy transition-colors"
                >
                  Explore
                  <ArrowRight
                    className="h-3 w-3 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </LefaLink>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function LivestockSplit() {
  return (
    <section className="grid lg:grid-cols-2">
      <div className="relative flex items-center bg-navy px-6 py-20 md:px-14 md:py-28 lg:px-20">
        <Leaf
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 -right-6 h-56 w-56 text-[color-mix(in_oklab,var(--heritage)_28%,transparent)]"
          strokeWidth={0.4}
        />
        <div className="relative max-w-xl">
          <SectionHeading
            tone="light"
            eyebrow="Livestock & enterprise"
            title="Connecting people, livestock and opportunity."
            intro="From livestock management to operational excellence, Lefa Connect provides the tools and insights needed to build thriving livelihoods and resilient communities."
          />
          <Reveal delay={120} className="mt-9">
            <LefaLink to="/livestock-projects" variant="ghostLight">
              Explore the Lefa Vision
            </LefaLink>
          </Reveal>
        </div>
      </div>
      <div className="relative min-h-[22rem] lg:min-h-[38rem]">
        <img
          src="/lv12.png"
          alt="Livestock and enterprise"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  );
}

export function MembershipCta() {
  return (
    <Section tone="navy">
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <SectionHeading
            tone="light"
            eyebrow="Membership"
            title="Your journey starts here."
            intro="Join Lefa Connect and become part of a connected ecosystem focused on growth, opportunity and lasting impact."
          />
        </div>
        <Reveal delay={120} className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
          <LefaLink to="/apply" variant="primary" size="lg">
            Become a Member
          </LefaLink>
          <LefaLink to="/membership" variant="ghostLight" size="lg">
            Learn More
          </LefaLink>
        </Reveal>
      </Container>
    </Section>
  );
}

export function FutureVision() {
  return (
    <Section tone="ivory">
      <Container>
        <SectionHeading
          eyebrow="Future vision"
          title="Building for what comes next."
          intro="Lefa Connect is being developed as a digital foundation for connected membership, livestock development, operational management and sustainable enterprise."
        />
        <ul className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {FUTURE_PILLARS.map((pillar, index) => (
            <Reveal
              as="li"
              key={pillar.title}
              delay={index * 70}
              className="bg-white border border-[color-mix(in_oklab,var(--on-navy)_6%,transparent)] px-8 py-10 transition-all duration-300 hover:border-[color-mix(in_oklab,var(--heritage)_40%,transparent)] hover:shadow-sm"
            >
              <span className="eyebrow text-[0.7rem] tracking-wider font-semibold text-[var(--gold)]">{pillar.step}</span>
              <h3 className="mt-6 font-display text-lg leading-snug text-navy">
                {pillar.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {pillar.copy}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
