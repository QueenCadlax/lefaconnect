import { createFileRoute } from "@tanstack/react-router";
import { Boxes, FileText, Landmark, Leaf, Users, Wallet } from "lucide-react";
import heroCattle from "@/assets/hero-cattle.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Placeholder, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { ECOSYSTEM_CARDS, HOW_IT_WORKS } from "@/components/site/data";

const title = "How It Works — LEFA CONNECT";
const description =
  "Join, participate, connect and grow: how membership, contributions and livestock come together in the Lefa Connect platform.";

export const Route = createFileRoute("/how-it-works")({
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
  component: HowItWorksPage,
});

const ICONS = [Users, Wallet, FileText, Leaf, Boxes, Landmark];

function HowItWorksPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="How it works"
        title="From joining to growing, one connected pathway."
        intro="Four clear stages, supported by six connected domains of the Lefa Connect platform."
        image={heroCattle}
      />

      <Section tone="ivory">
        <Container>
          <ol className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item, index) => (
              <Reveal as="li" key={item.step} delay={index * 90} className="relative">
                <div aria-hidden="true" className="mb-6 h-px w-full bg-border" />
                <p className="font-display text-4xl text-[var(--gold)]">{item.step}</p>
                <h2 className="mt-3 font-display text-2xl text-navy">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.copy}
                </p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container>
          <SectionHeading
            eyebrow="Platform domains"
            title="What the platform will hold."
            intro="Detailed processes, approvals and business rules are still being confirmed with the organisation."
          />
          <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM_CARDS.map((card, index) => {
              const Icon = ICONS[index]!;
              return (
                <Reveal
                  as="article"
                  key={card.title}
                  delay={(index % 3) * 80}
                  className="bg-card p-9"
                >
                  <Icon className="h-5 w-5 text-heritage" aria-hidden="true" />
                  <h3 className="mt-6 font-display text-2xl text-navy">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {card.copy}
                  </p>
                </Reveal>
              );
            })}
          </div>
          <Reveal className="mt-10 text-sm text-muted-foreground">
            <p>
              Workflow rules, approval steps and eligibility criteria
              <Placeholder>Rules to confirm</Placeholder>
            </p>
          </Reveal>
        </Container>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
