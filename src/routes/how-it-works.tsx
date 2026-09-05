import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaLink } from "@/components/ui/lefa-button";
import { publicSeoHead } from "@/lib/seo";

const title = "How It Works — LEFA CONNECT";
const description =
  "Understand how to join Lefa, what happens after you apply and how Lefa Connect supports the organisation behind the scenes.";

export const Route = createFileRoute("/how-it-works")({
  head: () => publicSeoHead(title, description, "/how-it-works"),
  component: HowItWorksPage,
});

const STEPS = [
  [
    "01",
    "Apply",
    "Complete the online membership application and provide the required information.",
  ],
  [
    "02",
    "Application Review",
    "The Lefa team reviews your application and the information you have provided.",
  ],
  [
    "03",
    "Approval",
    "If your application is approved, you can proceed with the membership payment process.",
  ],
  [
    "04",
    "Joining Fee",
    "Pay the R2,500 non-refundable joining fee. The payment is recorded against your application and membership record.",
  ],
  [
    "05",
    "Contribution & Agreement",
    "Make your first R500 monthly contribution and complete the required agreement and acceptance process.",
  ],
  [
    "06",
    "Active Member",
    "Once the required steps have been completed and verified, your membership becomes active.",
  ],
] as const;

const AREAS = [
  ["Membership", "Applications, member profiles and membership records."],
  ["Contributions", "Payment records, contribution history and statements."],
  ["Documents", "Agreements, certificates and important member records."],
  ["Livestock", "Livestock information, ownership, farms and development activities."],
  ["Operations", "Assets, inventory, procurement, suppliers and logistics."],
  ["Management", "Administration, oversight and organisational reporting."],
] as const;

function HowItWorksPage() {
  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-[#173f36] py-20 text-on-navy md:py-28">
        <video
          src="/lv3.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Lefa livestock and agricultural work"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#173f36]/75" />
        <Container className="relative">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-[var(--gold)]">How it works</p>
            <h1 className="mt-5 max-w-2xl font-display text-[2.35rem] leading-[1.04] text-on-navy md:text-[3.2rem]">
              Joining Lefa is a simple, structured process.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-navy-muted md:text-lg">
              Lefa is built around participation. Whether you are joining from Zimbabwe, another
              part of Africa or somewhere else in the world, the process begins with an application
              and continues through approval, payment, the required agreement and activation of your
              membership.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-navy-muted md:text-base">
              Lefa Connect keeps the process organised so that your information, payments and
              membership records are properly recorded from the beginning.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section tone="ivory">
        <Container>
          <div className="grid items-end gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <SectionHeading eyebrow="Before you join" title="Understand the commitment." />
            <Reveal className="grid gap-5 sm:grid-cols-3">
              {[
                ["R2,500", "Non-refundable joining fee"],
                ["R500", "Standard monthly contribution"],
                ["10 shares", "Standard membership structure"],
              ].map(([amount, label]) => (
                <div key={amount} className="border-t border-border pt-4">
                  <p className="font-display text-[2rem] leading-none text-navy">{amount}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{label}</p>
                </div>
              ))}
            </Reveal>
          </div>
          <Reveal
            delay={100}
            className="mt-8 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Your application is reviewed before membership is approved. Once approved, the
              required payments and agreement process must be completed before your membership
              becomes active.
            </p>
            <LefaLink to="/membership" variant="outline" className="shrink-0">
              View Membership Details
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LefaLink>
          </Reveal>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container>
          <SectionHeading eyebrow="The process" title="From application to active membership." />
          <ol className="mt-10 grid gap-0 border-y border-border md:grid-cols-3 lg:grid-cols-6">
            {STEPS.map(([step, heading, copy], index) => (
              <Reveal
                as="li"
                key={step}
                delay={index * 70}
                className="border-b border-border py-5 md:border-r md:px-4 md:last:border-r-0 lg:px-5"
              >
                <p className="font-display text-xl leading-none text-heritage">{step}</p>
                <h2 className="mt-4 font-display text-lg leading-tight text-navy">{heading}</h2>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{copy}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="After joining"
              title="Your membership becomes part of a bigger picture."
            />
            <Reveal
              delay={100}
              className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              <p>
                Becoming a member is not simply about creating an account. Your membership creates a
                recorded connection between you, the organisation and the activities you participate
                in.
              </p>
              <p>
                Through Lefa Connect, members can access their membership information, contribution
                records, documents and other relevant information connected to their participation.
              </p>
              <p>
                As Lefa develops, the platform will also support the organisation&apos;s livestock
                activities, projects and wider operations.
              </p>
              <p className="border-l-2 border-[var(--gold)] pl-5 font-display text-lg leading-tight text-navy md:text-xl">
                Your participation should be properly recorded, easy to follow and connected to the
                wider work of Lefa.
              </p>
            </Reveal>
          </div>
          <Reveal
            delay={120}
            className="relative aspect-[4/3] overflow-hidden border border-border"
          >
            <video
              src="/lh%20x%20lc.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-label="People and livestock connected through Lefa"
              className="h-full w-full object-cover"
            />
          </Reveal>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container>
          <SectionHeading
            eyebrow="Your contributions"
            title="Every contribution is recorded."
            intro="Your monthly contribution is recorded against your membership. This creates a clear history of what has been paid and keeps your membership records up to date."
          />
          <Reveal
            delay={100}
            className="mt-7 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Lefa Connect gives the organisation a structured way to manage these records while
              giving members greater visibility into their own membership and contribution history.
            </p>
            <LefaLink to="/membership" variant="outline" className="shrink-0">
              Explore Membership
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LefaLink>
          </Reveal>
        </Container>
      </Section>

      <section className="relative isolate overflow-hidden border-y border-[color-mix(in_oklab,var(--on-navy)_8%,transparent)] bg-[#173f36]">
        <video
          src="/lv4.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Lefa livestock and organisational work"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#173f36]/80" />
        <Container className="relative py-20 text-on-navy md:py-24">
          <SectionHeading
            eyebrow="Behind the scenes"
            title="One place to keep the organisation connected."
            intro="There is a lot happening behind a membership organisation. Applications need to be reviewed, payments recorded, member information maintained, documents stored, and livestock and project information managed. Lefa Connect brings these areas together in one system."
            tone="light"
          />
          <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {AREAS.map(([heading, copy], index) => (
              <Reveal
                as="li"
                key={heading}
                delay={index * 60}
                className="border-t border-white/15 pt-4"
              >
                <h2 className="font-display text-lg text-on-navy">{heading}</h2>
                <p className="mt-2 text-sm leading-relaxed text-on-navy-muted">{copy}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <Section tone="ivory">
        <Container className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <SectionHeading eyebrow="Keeping things clear" title="A process people can understand." />
          <Reveal className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              Lefa is being built with the understanding that trust matters. Applications are
              reviewed before membership is activated. Payments are recorded. Membership information
              is maintained.
            </p>
            <p>
              This gives both the organisation and its members a clearer record of participation.
            </p>
            <p className="font-display text-lg leading-tight text-navy md:text-xl">
              The goal is not to make the process complicated. It is to make it clear.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Global community"
              title="Wherever you are, you can stay connected."
            />
            <Reveal
              delay={100}
              className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              <p>
                Lefa is rooted in Zimbabwe, but its community reaches much further. Members can be
                connected from across Africa and from around the world. Lefa Connect gives that
                wider community a shared digital place to manage their membership and remain
                connected to the organisation, even when they are far from the farm itself.
              </p>
            </Reveal>
          </div>
          <div aria-hidden="true" className="hidden border-l border-border pl-8 lg:block">
            <p className="font-display text-2xl leading-tight text-navy">
              Zimbabwe to Africa. Africa to the world.
            </p>
          </div>
        </Container>
      </Section>

      <CtaBand
        heading="Ready to take the first step?"
        intro="If the Lefa vision speaks to you and you would like to become part of the journey, start by submitting your application. The Lefa team will review your information and guide you through the next steps."
      />
    </SiteShell>
  );
}
