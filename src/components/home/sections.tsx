import { ArrowRight, Boxes, FileText, Landmark, Leaf, Users, Wallet } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaLink } from "@/components/ui/lefa-button";
import {
  ECOSYSTEM_STRIP,
  HOW_IT_WORKS,
  MEMBERSHIP_ACTIVATION,
  MEMBERSHIP_STRUCTURE,
  OPERATIONS_GROUPS,
} from "@/components/site/data";

export function Hero() {
  const ecosystemIcons = [Users, Wallet, FileText, Leaf, Boxes, Landmark];

  return (
    <section className="relative isolate overflow-hidden bg-[#173f36] pt-20 text-on-navy lg:pt-20">
      <div className="absolute inset-0 lg:inset-y-6 lg:right-6 lg:left-auto lg:w-[51%]">
        <video
          src="/HERO.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Lefa Connect livestock and landscape"
          className="h-full w-full object-cover object-center opacity-25 lg:rounded-[1.5rem] lg:opacity-100"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#173f36] via-[color-mix(in_oklab,#173f36_72%,transparent)] to-transparent lg:from-[color-mix(in_oklab,#173f36_78%,transparent)] lg:via-transparent lg:to-transparent"
        />
      </div>
      <Container className="relative flex min-h-[31rem] items-center py-14 md:min-h-[34rem] md:py-16 lg:min-h-[35rem] lg:py-14">
        <Reveal className="max-w-2xl rounded-[0.75rem] border border-white/10 bg-[color-mix(in_oklab,#173f36_78%,transparent)] p-6 shadow-[0_16px_40px_-30px_oklch(0.15_0.05_160_/_0.5)] backdrop-blur-sm sm:p-8 lg:max-w-xl lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <p className="eyebrow text-[var(--gold)]">Welcome to Lefa Connect</p>
          <h1 className="mt-5 max-w-xl font-display text-[2.45rem] leading-[1.02] text-on-navy sm:text-[3.2rem] lg:text-[3.5rem]">
            Connecting our people.
            <br />
            <span className="text-[var(--gold)]">Protecting our heritage.</span>
            <br />
            Building our future.
          </h1>
          <div className="mt-6 h-px w-14 bg-[var(--gold)]" />
          <p className="mt-5 max-w-xl text-base leading-relaxed text-on-navy-muted md:text-lg">
            A connected platform for members, contributions, livestock, records and organisational
            operations, built to strengthen participation and long-term growth.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LefaLink to="/apply" variant="ivory" size="md">
              Become a Member
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LefaLink>
            <LefaLink to="/about" variant="ghostLight" size="md">
              Explore Lefa Connect
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LefaLink>
          </div>
        </Reveal>
      </Container>

      <div className="relative border-t border-white/10 bg-[#1e5146]">
        <Container>
          <ul className="grid grid-cols-2 divide-x divide-y divide-white/10 md:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
            {ECOSYSTEM_STRIP.map((item, index) => {
              const Icon = ecosystemIcons[index]!;
              return (
                <Reveal
                  as="li"
                  key={item.label}
                  delay={index * 70}
                  className="min-h-28 px-4 py-5 md:px-5 lg:min-h-24 lg:px-5 lg:py-5"
                >
                  <Icon className="h-4 w-4 text-[var(--gold)]" aria-hidden="true" />
                  <p className="eyebrow mt-3 text-[0.58rem] tracking-[0.16em] text-on-navy">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-on-navy-muted">{item.phrase}</p>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </div>
    </section>
  );
}

export function EcosystemStrip() {
  return (
    <section className="border-b border-[color-mix(in_oklab,var(--on-navy)_5%,transparent)] bg-card">
      <Container>
        <ul className="grid grid-cols-1 divide-y divide-[color-mix(in_oklab,var(--on-navy)_5%,transparent)] sm:grid-cols-2 sm:divide-x lg:grid-cols-6 lg:divide-y-0">
          {ECOSYSTEM_STRIP.map((item, index) => {
            return (
              <Reveal
                as="li"
                key={item.label}
                delay={index * 70}
                className="px-3 py-6 first:pl-0 sm:px-5 lg:px-3"
              >
                <p className="eyebrow text-[0.65rem] tracking-[0.16em] text-navy font-semibold">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.phrase}</p>
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
            title="Rooted in Zimbabwe. Connected to the world."
            intro="Lefa Connect is rooted in a real agricultural project on a working farm in Zimbabwe, where the journey begins with livestock, land, people and the opportunity to build something that can grow beyond one place."
          />
          <Reveal
            delay={120}
            className="mt-5 max-w-xl space-y-4 text-sm leading-relaxed text-muted-foreground"
          >
            <p>But Lefa was never meant to stop at the farm.</p>
            <p>
              Our members and community are connected from different parts of Africa and from around
              the world. Lefa Connect brings those people together through one shared platform,
              making it easier to manage membership, contributions, records, livestock activities,
              documents and the wider work of the organisation.
            </p>
            <p>
              The farm is where the journey is rooted. The vision reaches much further - connecting
              Africans and the wider African diaspora around participation, opportunity, growth and
              a shared sense of heritage.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-9">
            <LefaLink to="/about" variant="outline">
              Learn More About Us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LefaLink>
          </Reveal>
          <Reveal delay={160} className="mt-7 border-l-2 border-[var(--gold)] pl-5">
            <p className="font-display text-base leading-tight text-navy md:text-lg">
              From a farm in Zimbabwe to a community without borders.
            </p>
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
            className="relative aspect-[4/5] w-full object-cover"
          />
        </Reveal>
      </Container>
    </Section>
  );
}

export function FounderPreview() {
  return (
    <Section tone="ivory" className="border-y border-border">
      <Container className="grid items-center gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
        <Reveal className="relative aspect-[4/3] max-h-[30rem] overflow-hidden border border-[color-mix(in_oklab,var(--heritage)_28%,var(--border))]">
          <img
            src="/Lowveldhub%20x%20Lefa%20Connect%20Founder.png"
            alt="Lefa Connect founder speaking with cattle behind him"
            className="h-full w-full object-cover object-center"
          />
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="The man behind Lefa Heritage"
            title="From Responsibility to a Vision for Africa"
            className="[&_h2]:text-[1.75rem] [&_h2]:leading-[1.08] md:[&_h2]:text-[2.1rem] lg:[&_h2]:text-[2.35rem]"
          />
          <Reveal
            delay={100}
            className="mt-5 max-w-2xl space-y-3 text-xs leading-relaxed text-muted-foreground md:text-sm"
          >
            <p>
              Lefa Heritage was born from a journey shaped by responsibility, discipline,
              perseverance and a belief in what Africans can achieve when they work together.
            </p>
            <p>
              At 19, the founder left Zimbabwe for South Africa in search of greater opportunities.
              The journey was not easy. It came with rejection, difficult seasons and moments of
              doubt, but those experiences taught him the importance of discipline, keeping his word
              and continuing forward even when nobody was watching.
            </p>
            <p>
              One of his greatest achievements has been earning the trust of people he had never
              met, from Zimbabwe and across the African diaspora. That trust reinforced a principle
              that remains central to Lefa Heritage:{" "}
              <strong className="font-semibold text-navy">
                people and integrity must come before profit.
              </strong>
            </p>
            <p>
              Lefa Heritage is therefore about more than livestock. It is about creating
              opportunities, connecting Africans, building trust and demonstrating what is possible
              when people work together around a shared purpose.
            </p>
            <p>
              The word <strong className="font-semibold text-navy">Heritage</strong> represents the
              bigger vision: to build something that can create value beyond one generation,
              something our children can inherit, build upon and be proud of.
            </p>
          </Reveal>
          <Reveal delay={140} className="mt-6 border-l-2 border-[var(--gold)] pl-5">
            <p className="font-display text-base leading-tight text-navy md:text-lg">
              Building Together. Growing Together. Leaving a Heritage.
            </p>
          </Reveal>
          <Reveal delay={180} className="mt-7">
            <LefaLink to="/about" variant="outline">
              Read the Founder&apos;s Story
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LefaLink>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

export function MembershipFinance() {
  const overviewCopy = [
    "Non-refundable joining fee",
    "Standard monthly contribution",
    "Standard allocation",
  ];

  return (
    <Section tone="white">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-[0.7rem] font-medium tracking-[0.24em] text-[var(--gold)] uppercase">
            Membership & Contributions
          </p>
          <h2 className="mt-4 font-display text-[1.9rem] leading-[1.08] tracking-[-0.04em] text-navy sm:text-[2.35rem]">
            A clear way to join, contribute and participate in Lefa Connect.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {MEMBERSHIP_STRUCTURE.map((item, index) => (
            <Reveal
              key={item.label}
              delay={index * 100}
              className="group border-t border-[color-mix(in_oklab,var(--on-navy)_10%,transparent)] pt-5"
            >
              <p className="eyebrow text-[0.6rem] font-semibold tracking-[0.16em] text-heritage uppercase">
                {overviewCopy[index]}
              </p>
              <p className="mt-4 font-display text-[2.1rem] leading-none tracking-[-0.04em] text-navy">
                {item.amount}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={200}
          className="mx-auto mt-8 max-w-2xl border-t border-border pt-5 text-center"
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            Payments are recorded against the member&apos;s official record, and the approved
            membership and share structure determines the recorded shareholding.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

export function MembershipActivation() {
  return (
    <Section tone="navy" className="bg-[#173f36] py-10 md:py-12">
      <Container>
        <SectionHeading
          eyebrow="How membership works"
          title="A simple path from application to active membership."
          tone="light"
        />
        <ol className="mt-8 grid gap-0 border-t border-[color-mix(in_oklab,var(--on-navy)_15%,transparent)] md:grid-cols-3 lg:grid-cols-6">
          {MEMBERSHIP_ACTIVATION.map((item, index) => (
            <Reveal
              as="li"
              key={item.step}
              delay={index * 70}
              className="relative border-b border-[color-mix(in_oklab,var(--on-navy)_15%,transparent)] py-4 md:border-r md:px-4 md:last:border-r-0 lg:px-5"
            >
              <span className="font-display text-lg leading-none text-[var(--gold)]">
                {item.step}
              </span>
              <h3 className="mt-3 font-display text-base leading-tight text-on-navy">
                {item.title}
              </h3>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function LivestockVideoBreak() {
  return (
    <section className="relative isolate overflow-hidden border-y border-[color-mix(in_oklab,var(--on-navy)_8%,transparent)] bg-[#173f36]">
      <video
        src="/lv4.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="h-[22rem] w-full object-cover opacity-80 md:h-[30rem]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[color-mix(in_oklab,#173f36_86%,transparent)] via-[color-mix(in_oklab,#173f36_46%,transparent)] to-[color-mix(in_oklab,#173f36_20%,transparent)]"
      />
      <Container className="relative py-6 md:py-8">
        <div className="max-w-xl" aria-hidden="true" />
      </Container>
    </section>
  );
}

export function HowItWorks() {
  return (
    <Section
      tone="navy"
      className="border-y border-[color-mix(in_oklab,var(--on-navy)_8%,transparent)] bg-[#173f36]"
    >
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="From membership to participation and growth."
          tone="light"
        />
        <ol className="relative mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <div
            aria-hidden="true"
            className="absolute top-7 right-0 left-0 hidden h-px bg-[color-mix(in_oklab,var(--on-navy)_18%,transparent)] lg:block"
          />
          {HOW_IT_WORKS.map((item, index) => (
            <Reveal
              as="li"
              key={item.step}
              delay={index * 90}
              className="relative rounded-[1.1rem] border border-[color-mix(in_oklab,var(--on-navy)_12%,transparent)] bg-[color-mix(in_oklab,#173f36_78%,transparent)] p-5 transition-all duration-300 hover:border-[color-mix(in_oklab,var(--gold)_40%,transparent)] md:p-6"
            >
              <span
                aria-hidden="true"
                className="absolute -top-[0.35rem] left-5 hidden h-2 w-2 rounded-full bg-[var(--gold)] lg:block"
              />
              <p className="font-display text-[2.2rem] leading-none tracking-[-0.06em] text-[var(--gold)] lg:mt-7">
                {item.step}
              </p>
              <h3 className="mt-5 font-display text-[1.7rem] leading-[1.08] tracking-[-0.03em] text-on-navy">
                {item.title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-on-navy-muted">
                {item.copy}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function LivestockSplit() {
  return (
    <section className="grid lg:grid-cols-2">
      <div className="relative flex items-center bg-[#173f36] px-6 py-20 md:px-14 md:py-28 lg:px-20">
        <Leaf
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 right-2 h-40 w-40 text-[color-mix(in_oklab,var(--heritage)_28%,transparent)] md:-top-6 md:-right-6 md:h-56 md:w-56"
          strokeWidth={0.4}
        />
        <div className="relative max-w-xl">
          <SectionHeading
            tone="light"
            eyebrow="Livestock & enterprise"
            title="Connecting people, livestock and opportunity."
            intro="Lefa Connect provides a structured foundation for managing livestock information, farm activities and development projects while connecting these activities to broader organisational operations and enterprise opportunities."
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
    <Section tone="navy" className="bg-[#173f36]">
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <SectionHeading
            tone="light"
            eyebrow="JOIN LEFA CONNECT"
            title="Your place in the Lefa ecosystem starts here."
            intro="Apply to become part of Lefa Connect and establish your membership within a structured organisation built around participation, livestock development, operational coordination and long-term growth."
          />
        </div>
        <Reveal
          delay={120}
          className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end"
        >
          <LefaLink to="/apply" variant="ivory" size="lg">
            Become a Member
          </LefaLink>
          <LefaLink to="/contact" variant="ghostLight" size="lg">
            Contact Lefa Connect
          </LefaLink>
        </Reveal>
      </Container>
    </Section>
  );
}

export function OrganisationalOperations() {
  return (
    <Section tone="ivory">
      <Container>
        <SectionHeading
          eyebrow="THE OPERATING FOUNDATION"
          title="Everything connected. Everything accountable."
          intro="Lefa Connect brings the organisation's members, livestock, financial records, documents, resources and operational activities into one structured environment."
        />
        <div className="mt-10 grid gap-0 border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
          {OPERATIONS_GROUPS.map((group, index) => (
            <Reveal
              as="article"
              key={group.title}
              delay={index * 80}
              className="border-b border-border py-6 last:border-b-0 md:border-b-0 md:px-7 md:first:pl-0 md:last:pr-0"
            >
              <p className="eyebrow text-[0.62rem] tracking-[0.2em] text-heritage">0{index + 1}</p>
              <h3 className="mt-4 font-display text-[1.7rem] leading-[1.08] tracking-[-0.03em] text-navy">
                {group.title}
              </h3>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy">{group.copy}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function FutureVision() {
  const visionPillars = [
    {
      title: "People",
      copy: "Connecting members and communities across Africa and around the world.",
    },
    {
      title: "Enterprise",
      copy: "Developing livestock, projects and opportunities that create productive value.",
    },
    {
      title: "Heritage",
      copy: "Building something that can grow beyond one generation and leave something meaningful for those who come after us.",
    },
  ];

  return (
    <Section tone="ivory">
      <Container>
        <SectionHeading
          eyebrow="The Lefa Vision"
          title="Building for long-term growth."
          intro="A shared future built around people, productive enterprise and a heritage that lasts."
        />
        <ul className="mt-9 grid gap-6 md:grid-cols-3">
          {visionPillars.map((pillar, index) => (
            <Reveal
              as="li"
              key={pillar.title}
              delay={index * 70}
              className="border-t border-border pt-5"
            >
              <h3 className="font-display text-[1.45rem] leading-[1.08] tracking-[-0.03em] text-navy">
                {pillar.title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {pillar.copy}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
