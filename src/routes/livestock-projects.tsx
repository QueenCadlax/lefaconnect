import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { publicSeoHead } from "@/lib/seo";
import { LefaLink } from "@/components/ui/lefa-button";

const title = "Livestock & Projects — LEFA CONNECT";
const description =
  "Lefa begins with a real agricultural foundation in Zimbabwe and a wider vision for livestock, agriculture, enterprise and community.";

export const Route = createFileRoute("/livestock-projects")({
  head: () => publicSeoHead(title, description, "/livestock-projects"),
  component: LivestockPage,
});

const DEVELOPMENT_AREAS = [
  ["Livestock", "Growing and responsibly managing the agricultural foundation."],
  ["Agriculture", "Developing productive activities connected to land, livestock and farming."],
  ["Enterprise", "Exploring opportunities that can grow around the agricultural foundation."],
  ["Community", "Creating ways for members and the wider Lefa community to remain connected."],
] as const;

function LivestockPage() {
  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-[#173f36] py-20 text-on-navy md:py-28">
        <video
          src="/lvh0.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Lefa agricultural foundation in Zimbabwe"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#173f36]/75" />
        <Container className="relative">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-[var(--gold)]">Livestock & Projects</p>
            <h1 className="mt-5 max-w-2xl font-display text-[2.35rem] leading-[1.04] text-on-navy md:text-[3.2rem]">
              Where the Lefa journey begins.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-navy-muted md:text-lg">
              At the heart of Lefa is a real agricultural project on a working farm in Zimbabwe.
              Livestock is part of the foundation from which the organisation is being built -
              connecting land, agriculture, people, opportunity and long-term heritage.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-navy-muted md:text-base">
              As Lefa grows, the vision is to develop this foundation into projects and
              opportunities that can connect members and communities beyond the farm itself.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section tone="ivory">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="The foundation"
              title="Rooted in a working farm in Zimbabwe."
            />
            <Reveal
              delay={100}
              className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              <p>Lefa&apos;s story is grounded in agriculture.</p>
              <p>
                The farm in Zimbabwe provides the physical foundation for the livestock journey and
                gives the wider Lefa vision something real to build from. It is where agricultural
                work takes place and where the idea of building something that can grow beyond one
                generation becomes tangible.
              </p>
              <p>
                The purpose is not simply to own livestock. It is to build a foundation around
                agriculture that can create opportunity, support participation and become part of a
                much bigger story.
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
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading eyebrow="Livestock" title="Livestock is part of the heritage." />
          <Reveal className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              For Lefa, livestock represents more than numbers on a record. It is connected to land,
              livelihood, responsibility and heritage.
            </p>
            <p>
              A healthy livestock operation requires care, proper records, planning and responsible
              management. Over time, those foundations can support growth and create opportunities
              around agriculture and enterprise.
            </p>
            <p>
              Lefa Connect is being developed to help bring the information and administration
              behind that work into one organised environment.
            </p>
            <p className="border-l-2 border-[var(--gold)] pl-5 font-display text-lg leading-tight text-navy md:text-xl">
              The livestock, the land and the people are the foundation.
            </p>
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
            eyebrow="Managing the foundation"
            title="Keeping the important information together."
            intro="As the agricultural side of Lefa develops, keeping accurate information becomes increasingly important. Lefa Connect provides a central place for the organisation to maintain relevant livestock and project records alongside its wider membership and operational information."
            tone="light"
          />
          <Reveal
            delay={100}
            className="mt-8 max-w-2xl text-sm leading-relaxed text-on-navy-muted md:text-base"
          >
            <p>Where applicable, this can include:</p>
          </Reveal>
          <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Livestock Records", "Information about animals and the livestock operation."],
              ["Farm Information", "Records connected to farms and agricultural activities."],
              [
                "Projects",
                "Information about agricultural and enterprise projects as they develop.",
              ],
              [
                "Ownership & Participation",
                "Records connecting relevant information to the appropriate organisational and membership records.",
              ],
              ["Documents", "Supporting documentation connected to livestock and projects."],
            ].map(([heading, copy], index) => (
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
        <Container>
          <SectionHeading
            eyebrow="Projects"
            title="Building from what is real."
            intro="Lefa's projects will develop from the organisation's agricultural foundation and its wider vision. Rather than presenting projects that do not yet exist, the focus is on the direction in which Lefa is building."
          />
          <ul className="mt-10 grid gap-6 border-y border-border md:grid-cols-4">
            {DEVELOPMENT_AREAS.map(([heading, copy], index) => (
              <Reveal
                as="li"
                key={heading}
                delay={index * 70}
                className="border-b border-border py-6 last:border-b-0 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <h2 className="font-display text-xl text-navy">{heading}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Beyond the farm"
              title="The farm is the beginning, not the boundary."
            />
            <Reveal
              delay={100}
              className="mt-6 text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              <p>
                The physical foundation of Lefa is in Zimbabwe, but the vision does not end there.
                People connected to Lefa can be based in different parts of Africa and around the
                world.
              </p>
              <p className="mt-4">
                The long-term opportunity is to connect that wider community to a real agricultural
                foundation and to the projects and enterprise that can develop from it.
              </p>
              <p className="mt-7 border-l-2 border-[var(--gold)] pl-5 font-display text-lg leading-tight text-navy md:text-xl">
                One foundation. Many people. A vision that can grow.
              </p>
            </Reveal>
          </div>
          <Reveal
            delay={120}
            className="relative aspect-[4/3] overflow-hidden border border-border"
          >
            <video
              src="/lv5.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Lefa community and agricultural journey"
              className="h-full w-full object-cover"
            />
          </Reveal>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            eyebrow="The member connection"
            title="Your membership connects you to the journey."
          />
          <Reveal className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              Members are not simply joining a digital platform. They are becoming part of an
              organisation whose foundation is rooted in agriculture and whose ambition is to create
              opportunities that can grow over time.
            </p>
            <p>
              Lefa Connect provides the digital environment that helps keep members, records,
              contributions, projects and organisational activities connected as the agricultural
              and enterprise side of Lefa develops.
            </p>
          </Reveal>
        </Container>
      </Section>

      <CtaBand
        heading="From the land to a wider vision."
        intro="Lefa begins with something tangible: land, livestock, people and a willingness to build. The ambition is to take that foundation further by connecting people across borders around agriculture, enterprise and heritage."
      />
    </SiteShell>
  );
}
