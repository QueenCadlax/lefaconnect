import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { publicSeoHead } from "@/lib/seo";
import { Container, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaLink } from "@/components/ui/lefa-button";

const title = "Operations — LEFA CONNECT";
const description =
  "Lefa Connect helps keep the records, documents, contributions, membership information and work behind Lefa organised.";

export const Route = createFileRoute("/operations")({
  head: () => publicSeoHead(title, description, "/operations"),
  component: OperationsPage,
});

const AREAS = [
  [
    "Membership",
    "Member information, applications, membership status and the records connected to each member.",
  ],
  [
    "Contributions",
    "Joining fees, monthly contributions and payment records connected to membership.",
  ],
  [
    "Documents & Records",
    "Important documents and organisational records kept together and accessible to the people who need them.",
  ],
  [
    "Livestock & Activities",
    "Information connected to livestock and the wider activities of the organisation as Lefa continues to develop.",
  ],
] as const;

function OperationsPage() {
  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-[#173f36] py-20 text-on-navy md:py-28">
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
        <Container className="relative">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-[var(--gold)]">Operations</p>
            <h1 className="mt-5 max-w-2xl font-display text-[2.35rem] leading-[1.04] text-on-navy md:text-[3.2rem]">
              Keeping the work behind Lefa organised.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-navy-muted md:text-lg">
              Lefa Connect brings the records, documents, contributions, membership information and
              day-to-day organisational work into one connected place, helping the people behind
              Lefa keep track of what matters.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section tone="ivory">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            eyebrow="The work behind Lefa"
            title="The work behind the vision matters too."
          />
          <Reveal className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              Lefa is built around people, livestock, land and participation. Behind all of that is
              the everyday work that keeps an organisation moving - keeping records up to date,
              managing documents, following contributions, coordinating activities and making sure
              important information is not lost.
            </p>
            <p>Lefa Connect provides the digital foundation for that work.</p>
            <p>
              The purpose is simple: keep important information together, make it easier for the
              people responsible for Lefa to manage it, and give members a clearer connection to the
              organisation.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container>
          <SectionHeading
            eyebrow="What Lefa Connect helps organise"
            title="The information that keeps Lefa moving."
          />
          <ul className="mt-10 grid gap-6 border-y border-border md:grid-cols-2">
            {AREAS.map(([heading, copy], index) => (
              <Reveal
                as="li"
                key={heading}
                delay={index * 70}
                className="border-b border-border py-6 last:border-b-0 md:px-6 md:even:border-l md:first:pl-0 md:last:pr-0"
              >
                <h2 className="font-display text-[1.45rem] leading-tight text-navy">{heading}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {copy}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <SectionHeading
            eyebrow="One place for the work"
            title="One place for the information that matters."
          />
          <Reveal className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              As Lefa grows, so does the amount of information behind it. Keeping that information
              organised becomes increasingly important.
            </p>
            <p>
              Lefa Connect brings the different parts of the organisation together so that
              membership, contributions, documents, livestock activities and organisational records
              can be managed from one place.
            </p>
            <p className="border-l-2 border-[var(--gold)] pl-5 font-display text-lg leading-tight text-navy md:text-xl">
              The goal is not to make the work complicated. It is to make it easier to keep track
              of.
            </p>
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
          aria-label="Lefa community and agricultural journey"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#173f36]/80" />
        <Container className="relative py-20 text-on-navy md:py-24">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-[var(--gold)]">Built to grow with Lefa</p>
            <h2 className="mt-4 font-display text-[2rem] leading-tight text-on-navy md:text-[2.7rem]">
              As Lefa grows, the platform grows with it.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-on-navy-muted md:text-base">
              Lefa Connect is being developed alongside the organisation it supports. As Lefa
              expands its membership, agricultural activities and enterprise opportunities, the
              platform can provide a stronger foundation for managing the work that comes with that
              growth.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-on-navy-muted md:text-base">
              The focus remains practical: better organisation, clearer records and a stronger
              connection between the people, activities and information that make Lefa what it is.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section tone="white" className="border-y border-border">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="The real foundation"
              title="The farm is where the journey begins."
            />
            <Reveal
              delay={100}
              className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              <p>
                Lefa&apos;s story is rooted in a real agricultural project on a working farm in
                Zimbabwe.
              </p>
              <p>
                That foundation gives the organisation something real to build around - livestock,
                land, people and the responsibility that comes with creating something that can grow
                beyond one place.
              </p>
              <p>
                Lefa Connect exists to support the work around that vision, connecting the people
                and information involved as the organisation develops.
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
              aria-label="People, livestock and land connected through Lefa"
              className="h-full w-full object-cover"
            />
          </Reveal>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-heritage">The next step</p>
            <h2 className="mt-3 font-display text-2xl text-navy">See what Lefa is building.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Lefa Connect brings together the people, records and work behind a growing
              agricultural vision rooted in Zimbabwe and connected to a wider community.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LefaLink to="/about" variant="outline">
              Explore Lefa Connect
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LefaLink>
            <LefaLink to="/apply" variant="ivory">
              Become a Member
            </LefaLink>
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
