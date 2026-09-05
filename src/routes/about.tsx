import { createFileRoute } from "@tanstack/react-router";
import aboutFarmer from "@/assets/about-farmer.jpg";
import livestockSplit from "@/assets/livestock-split.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { publicSeoHead } from "@/lib/seo";

const title = "About — LEFA CONNECT";
const description =
  "Lefa Connect brings people, livestock and organisational resources together through digital innovation and strong governance.";

export const Route = createFileRoute("/about")({
  head: () => publicSeoHead(title, description, "/about"),
  component: AboutPage,
});

const VALUES = [
  {
    title: "Heritage",
    lead: "Build something worth passing on.",
    copy: "Lefa is about creating something future generations can inherit, develop and be proud of.",
  },
  {
    title: "Integrity",
    lead: "Trust is earned through what we do.",
    copy: "We believe in keeping our word, taking responsibility and handling people, resources and commitments with honesty.",
  },
  {
    title: "Togetherness",
    lead: "Different places. One shared vision.",
    copy: "Lefa connects people across Africa and the wider African diaspora, creating a community that can participate wherever they live.",
  },
  {
    title: "Growth",
    lead: "Create opportunity and grow responsibly.",
    copy: "Growth should create real value for members, livestock, projects, communities and the organisation itself.",
  },
];

function AboutPage() {
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
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[color-mix(in_oklab,#173f36_72%,transparent)]"
        />
        <Container className="relative">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-[var(--gold)]">About Lefa Connect</p>
            <h1 className="mt-5 max-w-2xl font-display text-[2.35rem] leading-[1.04] text-on-navy md:text-[3.2rem]">
              Rooted in Zimbabwe. Connected to the world.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-navy-muted md:text-lg">
              Lefa Connect brings together people, livestock, membership, contributions and
              enterprise through one connected platform.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-navy-muted md:text-base">
              The journey is rooted in a real agricultural project on a working farm in Zimbabwe,
              where livestock, land, people and opportunity come together. But Lefa was never
              intended to remain in one place. The vision reaches across Africa and the wider
              African diaspora - connecting people wherever they are and creating a foundation for
              participation, opportunity, growth and shared heritage.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section tone="ivory">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Our story"
              title="From a farm in Zimbabwe to a vision without borders."
            />
            <Reveal
              delay={100}
              className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              <p>
                Lefa began with something real: a farm, livestock, people and a belief that what is
                built today can create opportunities for tomorrow.
              </p>
              <p>
                At the heart of Lefa is an agricultural project in Zimbabwe. It is where the vision
                is grounded - in the land, in livestock and in the responsibility that comes with
                building something that can grow.
              </p>
              <p>
                But the ambition has always been bigger than the farm. People connected to Lefa come
                from different parts of Africa and from around the world. They may live in different
                countries, but they share an interest in participating in something meaningful.
              </p>
              <p>
                Lefa Connect is being developed to bring those people, activities and opportunities
                together in one connected place.
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
        <Container>
          <Reveal delay={160} className="mt-10 border-l-2 border-[var(--gold)] pl-5">
            <p className="font-display text-lg leading-tight text-navy md:text-xl">
              The farm is where the journey is rooted. The people are what make it possible. The
              vision is where Lefa is going.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            eyebrow="What we are building"
            title="More than livestock. More than a platform."
          />
          <Reveal className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              Lefa is being built around the belief that people can create greater opportunities
              when they work together. Livestock is an important part of that foundation, but it is
              only one part of the bigger picture.
            </p>
            <p>
              The long-term vision includes membership, livestock development, enterprise,
              operational growth and opportunities that can extend beyond the original agricultural
              project.
            </p>
            <p>
              Lefa Connect provides the digital foundation that connects these activities. Members
              can participate, contribute and keep track of their records while the organisation
              manages its livestock information, documents and resources in one place.
            </p>
            <p className="border-l-2 border-[var(--gold)] pl-5 font-display text-lg leading-tight text-navy md:text-xl">
              The goal is to build an organisation that can connect people, create opportunity and
              leave something meaningful behind.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container>
          <SectionHeading eyebrow="What guides us" title="The values behind Lefa." />
          <ul className="mt-10 grid gap-8 border-y border-border sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border">
            {VALUES.map((value, index) => (
              <Reveal
                as="li"
                key={value.title}
                delay={index * 80}
                className="border-b border-border py-6 last:border-b-0 sm:px-6 sm:first:pl-0 lg:border-b-0 lg:py-2 lg:last:pr-0"
              >
                <h3 className="font-display text-[1.45rem] leading-tight text-navy">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm font-semibold leading-snug text-heritage">
                  {value.lead}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.copy}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <section className="relative isolate overflow-hidden border-y border-[color-mix(in_oklab,var(--on-navy)_8%,transparent)] bg-[#173f36]">
        <video
          src="/lv5.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Lefa community reaching across borders"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#173f36]/75" />
        <Container className="relative py-20 text-on-navy md:py-24">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-[var(--gold)]">Global reach</p>
            <h2 className="mt-4 font-display text-[2rem] leading-tight text-on-navy md:text-[2.7rem]">
              One foundation. A community without borders.
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-on-navy-muted md:text-base">
              Lefa may be rooted in Zimbabwe, but its community is not limited by geography. Members
              and supporters can remain connected from across Africa and from countries around the
              world, participate in the journey and follow the opportunities being built through
              Lefa.
            </p>
            <p className="mt-7 border-l-2 border-[var(--gold)] pl-5 font-display text-lg leading-tight text-on-navy md:text-xl">
              Zimbabwe is where the story is rooted. Africa is at the heart of the vision. The world
              is where the community reaches.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section tone="ivory">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-heritage">The journey ahead</p>
            <h2 className="mt-4 font-display text-[2rem] leading-tight text-navy md:text-[2.7rem]">
              Building today. Growing together. Leaving a heritage.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              Lefa is still being built. What exists today is the foundation for something that can
              become much bigger tomorrow - an organisation connecting people, agriculture,
              enterprise and opportunity across borders. Lefa Connect is helping build the systems
              behind that vision.
            </p>
          </Reveal>
        </Container>
      </Section>

      <CtaBand
        heading="Be part of what we are building."
        intro="Whether you are joining as a member, participating in the agricultural journey or simply want to understand the vision, Lefa Connect is creating a place where people can stay connected to the journey."
      />
    </SiteShell>
  );
}
