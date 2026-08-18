import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Placeholder, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";

const title = "Operations — LEFA CONNECT";
const description =
  "Procurement, inventory, assets and logistics, brought into one governed operational view within Lefa Connect.";

export const Route = createFileRoute("/operations")({
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
  component: OperationsPage,
});

const AREAS = [
  { title: "Procurement", copy: "Requests, suppliers and purchase records." },
  { title: "Inventory", copy: "Stock levels, issues and reconciliation." },
  { title: "Assets", copy: "Equipment, vehicles and infrastructure registers." },
  { title: "Logistics", copy: "Transport, movement and delivery coordination." },
  { title: "Reporting", copy: "Operational oversight and management reporting." },
  { title: "Administration", copy: "Roles, permissions and organisational governance." },
];

function OperationsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Operations"
        title="Operational excellence, recorded end to end."
        intro="Operations in Lefa Connect are being designed as a single governed layer across procurement, inventory, assets and logistics."
      />

      <Section tone="ivory">
        <Container>
          <SectionHeading
            eyebrow="Operational layer"
            title="Six operational areas."
            intro="Detailed operational policies and approval thresholds are still to be confirmed by the organisation."
          />
          <ul className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {AREAS.map((area, index) => (
              <Reveal as="li" key={area.title} delay={(index % 3) * 80} className="bg-card p-9">
                <h3 className="font-display text-2xl text-navy">{area.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {area.copy}
                </p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-10 text-sm text-muted-foreground">
            <p>
              Operational policies, thresholds and delegations
              <Placeholder>To confirm</Placeholder>
            </p>
          </Reveal>
        </Container>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
