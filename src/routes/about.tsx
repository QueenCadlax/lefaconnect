import { createFileRoute } from "@tanstack/react-router";
import aboutFarmer from "@/assets/about-farmer.jpg";
import livestockSplit from "@/assets/livestock-split.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Placeholder, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";

const title = "About — LEFA CONNECT";
const description =
  "Lefa Connect brings people, livestock and organisational resources together through digital innovation and strong governance.";

export const Route = createFileRoute("/about")({
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
  component: AboutPage,
});

const VALUES = [
  {
    title: "Heritage",
    copy: "Livestock and land are held as inheritance — the foundation on which livelihoods are built.",
  },
  {
    title: "Governance",
    copy: "Clear records, transparent contributions and accountable administration.",
  },
  {
    title: "Technology",
    copy: "Modern digital systems designed for real conditions and everyday use.",
  },
  {
    title: "Shared growth",
    copy: "Opportunity that compounds across members, communities and enterprise.",
  },
];

function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="About"
        title="More than a platform. A connected ecosystem."
        intro="Lefa Connect brings people, livestock and organisational resources together through digital innovation and strong governance."
        image={livestockSplit}
        imageAlt=""
      />

      <Section tone="ivory">
        <Container className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Our purpose"
              title="A serious organisation, modernising with intent."
              intro="The platform is designed to support members, streamline operations and create connected pathways for sustainable growth — one governed system rather than scattered records."
            />
            <Reveal delay={100} className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Organisational history, founding story and leadership profiles will appear
                here once confirmed by the client.
                <Placeholder>Content to confirm</Placeholder>
              </p>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <img
              src={aboutFarmer}
              alt="A livestock farmer reviewing herd records on a tablet"
              width={1200}
              height={1408}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </Reveal>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container>
          <SectionHeading eyebrow="What guides us" title="Principles we build on." />
          <ul className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <Reveal as="li" key={value.title} delay={index * 80} className="bg-card p-9">
                <h3 className="font-display text-2xl text-navy">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {value.copy}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
