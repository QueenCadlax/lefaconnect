import { createFileRoute } from "@tanstack/react-router";
import aboutFarmer from "@/assets/about-farmer.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Placeholder, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaLink } from "@/components/ui/lefa-button";

const title = "Membership — LEFA CONNECT";
const description =
  "Become part of a connected ecosystem focused on growth, opportunity and lasting impact with Lefa Connect membership.";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MembershipPage,
});

const BENEFITS = [
  { title: "Membership record", copy: "A verified profile and membership standing." },
  { title: "Contributions", copy: "Transparent contribution and payment records." },
  { title: "Documents", copy: "Access to contracts, certificates and statements." },
  { title: "Livestock", copy: "Herd, farm and movement information in one place." },
  { title: "Support", copy: "Structured channels for queries and requests." },
  { title: "Opportunity", copy: "Participation in wider Lefa enterprise initiatives." },
];

function MembershipPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Membership"
        title="Your journey starts here."
        intro="Join Lefa Connect and become part of a connected ecosystem focused on growth, opportunity and lasting impact."
        image={aboutFarmer}
      />

      <Section tone="ivory">
        <Container>
          <SectionHeading
            eyebrow="What membership includes"
            title="Structured, recorded and connected."
            intro="Membership categories, fees and qualifying criteria have not yet been confirmed and are shown as placeholders."
          />
          <ul className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit, index) => (
              <Reveal as="li" key={benefit.title} delay={(index % 3) * 80} className="bg-card p-9">
                <h3 className="font-display text-2xl text-navy">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {benefit.copy}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="navy">
        <Container className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHeading
              tone="light"
              eyebrow="Categories"
              title="Membership categories."
              intro="Individual, household, farm and enterprise categories will be defined once the organisation confirms its membership policy."
            />
            <Reveal className="mt-6 text-sm text-on-navy-muted">
              <p>
                Category names, fees and approval process
                <Placeholder>To confirm</Placeholder>
              </p>
            </Reveal>
          </div>
          <Reveal delay={100} className="lg:col-span-5 lg:justify-self-end">
            <LefaLink to="/apply" variant="primary" size="lg">
              Apply for Membership
            </LefaLink>
          </Reveal>
        </Container>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
