import { createFileRoute } from "@tanstack/react-router";
import livestockSplit from "@/assets/livestock-split.jpg";
import heroCattle from "@/assets/hero-cattle.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Placeholder, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";

const title = "Livestock & Projects — LEFA CONNECT";
const description =
  "From livestock management to operational excellence, Lefa Connect supports thriving livelihoods and resilient communities.";

export const Route = createFileRoute("/livestock-projects")({
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
  component: LivestockPage,
});

const FOCUS = [
  { title: "Herd records", copy: "Animal identification, health and lineage information." },
  { title: "Farms & land", copy: "Locations, grazing and infrastructure records." },
  { title: "Movement", copy: "Transfers, permits and traceability information." },
  { title: "Projects", copy: "Development and enterprise initiatives across the ecosystem." },
];

function LivestockPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Livestock & projects"
        title="Connecting people, livestock and opportunity."
        intro="From livestock management to operational excellence, Lefa Connect provides the tools and insights needed to build thriving livelihoods and resilient communities."
        image={heroCattle}
      />

      <Section tone="ivory">
        <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <img
              src={livestockSplit}
              alt="An Nguni bull in green highland pasture"
              width={1408}
              height={1408}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Focus areas"
              title="Livestock as living inheritance."
              intro="The platform is being designed to hold livestock and project information accurately, so that decisions are made on real records."
            />
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {FOCUS.map((item, index) => (
                <Reveal as="li" key={item.title} delay={index * 70} className="py-6">
                  <h3 className="font-display text-xl text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section tone="navy">
        <Container>
          <SectionHeading
            tone="light"
            eyebrow="Current projects"
            title="Project portfolio."
            intro="Active and planned livestock and enterprise projects will be listed here."
          />
          <Reveal className="mt-8 text-sm text-on-navy-muted">
            <p>
              Project names, locations and outcomes
              <Placeholder>To confirm</Placeholder>
            </p>
          </Reveal>
        </Container>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
