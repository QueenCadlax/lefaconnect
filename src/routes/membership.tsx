import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaLink } from "@/components/ui/lefa-button";
import { publicSeoHead } from "@/lib/seo";

const title = "Membership — LEFA CONNECT";
const description =
  "Understand Lefa membership slots, shares, joining fees and monthly contributions.";

export const Route = createFileRoute("/membership")({
  head: () => publicSeoHead(title, description, "/membership"),
  component: MembershipPage,
});

const MEMBERSHIP_OPTIONS = [
  {
    slots: "1 slot",
    shares: "10 Shares",
    fee: "R2,500",
    monthly: "R500 / month",
    copy: "The standard starting membership structure, representing one member slot and 10 shares.",
  },
  {
    slots: "2 slots",
    shares: "20 Shares",
    fee: "R5,000",
    monthly: "R1,000 / month",
    copy: "Two member slots representing 20 shares, with the corresponding contribution structure.",
  },
  {
    slots: "3 slots",
    shares: "30 Shares",
    fee: "R5,000",
    monthly: "R1,500 / month",
    copy: "Three member slots representing 30 shares.",
  },
  {
    slots: "4 slots",
    shares: "40 Shares",
    fee: "R7,500",
    monthly: "R2,000 / month",
    copy: "Four member slots representing 40 shares.",
  },
] as const;

function MembershipPage() {
  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-[#173f36] py-20 text-on-navy md:py-28">
        <video
          src="/lvh0.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Lefa agricultural and livestock foundation"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#173f36]/78" />
        <Container className="relative">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-[var(--gold)]">Membership</p>
            <h1 className="mt-5 max-w-2xl font-display text-[2.35rem] leading-[1.04] text-on-navy md:text-[3.2rem]">
              Your place in Lefa starts here.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-navy-muted md:text-lg">
              Lefa membership gives you a formal place within a growing community built around
              livestock, opportunity, participation and a shared vision for the future.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-navy-muted md:text-base">
              The membership structure is based on member slots. Your joining fee, monthly
              contribution and recorded shares correspond to the structure you select.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LefaLink to="/apply" variant="ivory" size="md">
                Become a Member
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LefaLink>
              <LefaLink to="/how-it-works" variant="ghostLight" size="md">
                How It Works
              </LefaLink>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section tone="ivory">
        <Container>
          <SectionHeading
            eyebrow="How membership is structured"
            title="Choose your level of participation."
            intro="Lefa membership is structured around member slots. Each slot represents 10 shares, with the applicable joining fee and monthly contribution increasing according to the number of slots selected."
          />
          <Reveal
            delay={100}
            className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            <p>
              This gives members a clear structure from the beginning and allows their recorded
              shareholding to correspond with their selected membership participation.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container>
          <SectionHeading eyebrow="Membership structure" title="Select your number of slots." />
          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {MEMBERSHIP_OPTIONS.map((option, index) => (
              <Reveal
                as="article"
                key={option.slots}
                delay={index * 70}
                className="border-t-2 border-[var(--heritage)] bg-card p-5 shadow-[0_12px_28px_-24px_rgba(10,20,30,0.35)]"
              >
                <p className="eyebrow text-heritage">{option.slots}</p>
                <p className="mt-4 font-display text-2xl leading-none text-navy">{option.shares}</p>
                <dl className="mt-6 space-y-4 border-y border-border py-4">
                  <div>
                    <dt className="text-[0.62rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Joining fee
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-navy">{option.fee}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.62rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Monthly contribution
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-navy">{option.monthly}</dd>
                  </div>
                </dl>
                <p className="mt-4 min-h-16 text-sm leading-relaxed text-muted-foreground">
                  {option.copy}
                </p>
                <LefaLink to="/apply" variant="outline" size="sm" className="mt-5 w-full">
                  Select {option.slots}
                </LefaLink>
              </Reveal>
            ))}
          </div>
          <Reveal
            delay={200}
            className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground"
          >
            The joining fee is non-refundable. Membership becomes active only after the application
            is approved and the required payment and agreement steps have been completed and
            verified.
          </Reveal>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading eyebrow="Understanding your membership" title="What is a member slot?" />
          <Reveal className="text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              A member slot is the unit used to structure participation within Lefa. Each member
              slot represents 10 shares, and the number of slots selected determines the
              corresponding joining fee and monthly contribution.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                "1 slot = 10 shares",
                "2 slots = 20 shares",
                "3 slots = 30 shares",
                "4 slots = 40 shares",
              ].map((item) => (
                <div
                  key={item}
                  className="border-t border-border pt-3 text-sm font-semibold text-navy"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-7 border-l-2 border-[var(--gold)] pl-5 font-display text-lg leading-tight text-navy md:text-xl">
              Your selected structure is recorded as part of your official membership record.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Your membership record"
              title="Everything recorded in one place."
            />
            <Reveal
              delay={100}
              className="mt-6 text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              <p>
                Once your application is approved and your membership becomes active, Lefa Connect
                keeps your membership information and relevant payment records connected to your
                member profile.
              </p>
            </Reveal>
          </div>
          <Reveal delay={120} className="border-y border-border py-5">
            <ul className="grid gap-3 text-sm text-navy sm:grid-cols-2">
              {[
                "Membership status",
                "Member number",
                "Selected membership structure",
                "Recorded shares",
                "Joining fee",
                "Monthly contribution",
                "Payment history",
                "Agreements and documents",
              ].map((item) => (
                <li key={item} className="border-b border-border pb-3">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <section className="relative isolate overflow-hidden border-y border-[color-mix(in_oklab,var(--on-navy)_8%,transparent)] bg-[#173f36]">
        <video
          src="/lv5.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Lefa community and livestock journey"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#173f36]/80" />
        <Container className="relative py-20 text-on-navy md:py-24">
          <SectionHeading
            eyebrow="Beyond membership"
            title="Membership is part of a bigger vision."
            intro="Lefa membership is connected to a wider vision that begins with agriculture and livestock in Zimbabwe and reaches towards a community connected across Africa and around the world. As Lefa grows, membership connects people to the organisation's broader journey, including livestock development, projects and enterprise."
            tone="light"
          />
        </Container>
      </section>

      <Section tone="ivory">
        <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            eyebrow="Membership is not automatic"
            title="Applying is the first step - not the final step."
          />
          <Reveal className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              Submitting an application does not automatically make you a Lefa member. Your
              application must first be reviewed and approved.
            </p>
            <p>
              After approval, the required joining fee, first monthly contribution and agreement
              process must be completed and verified before your membership becomes active.
            </p>
            <LefaLink to="/how-it-works" variant="outline" className="mt-3">
              See How Membership Works
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LefaLink>
          </Reveal>
        </Container>
      </Section>

      <CtaBand
        heading="Ready to become part of Lefa?"
        intro="Choose the membership structure that suits your participation and begin your application. The Lefa team will review your information and guide you through the next steps."
      />
    </SiteShell>
  );
}
