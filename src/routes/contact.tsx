import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Container, Section, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaLink } from "@/components/ui/lefa-button";
import { CONTACT_INFO } from "@/components/site/data";
import { publicSeoHead } from "@/lib/seo";

const title = "Contact — LEFA CONNECT";
const description =
  "Contact Lefa Connect about membership, the Lefa vision, livestock, projects or a general enquiry.";

export const Route = createFileRoute("/contact")({
  head: () => publicSeoHead(title, description, "/contact"),
  component: ContactPage,
});

const CONTACT_REASONS = [
  ["Membership", "Questions about joining Lefa Connect and membership participation."],
  ["The Lefa Vision", "Learn more about what Lefa is building and where the journey is heading."],
  [
    "Livestock & Projects",
    "Questions about the agricultural foundation and the work connected to it.",
  ],
  ["General Enquiries", "Anything else you would like to ask or discuss."],
] as const;

function ContactPage() {
  const whatsappHref = `https://wa.me/${CONTACT_INFO.phone.replace(/\D/g, "")}`;

  return (
    <SiteShell>
      <section className="bg-[#173f36] py-20 text-on-navy md:py-28">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-[var(--gold)]">Contact Lefa</p>
            <h1 className="mt-5 font-display text-[2.8rem] leading-[1.02] text-on-navy md:text-[3.6rem]">
              Let&apos;s talk.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-navy-muted md:text-lg">
              Whether you would like to learn more about membership, understand the Lefa vision, or
              simply have a question, we would be happy to hear from you.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section tone="ivory">
        <Container>
          <SectionHeading eyebrow="Get in touch" title="Choose the way that suits you." />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <Reveal className="border-t-2 border-[#25D366] bg-card p-6 shadow-[0_14px_32px_-26px_rgba(10,20,30,0.4)]">
              <MessageCircle className="h-6 w-6 text-[#25D366]" aria-hidden="true" />
              <h2 className="mt-5 font-display text-2xl text-navy">Chat with Lefa Connect</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                For quick questions and direct conversations.
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex h-11 items-center justify-center bg-[#25D366] px-5 text-xs font-semibold tracking-[0.14em] text-white uppercase hover:bg-[#20bd5a]"
              >
                WhatsApp Us
              </a>
            </Reveal>
            <Reveal
              delay={70}
              className="border-t-2 border-heritage bg-card p-6 shadow-[0_14px_32px_-26px_rgba(10,20,30,0.4)]"
            >
              <Phone className="h-6 w-6 text-heritage" aria-hidden="true" />
              <h2 className="mt-5 font-display text-2xl text-navy">Call Lefa Connect</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                For direct enquiries and conversations.
              </p>
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                className="mt-6 inline-flex h-11 items-center justify-center border border-navy px-5 text-xs font-semibold tracking-[0.14em] text-navy uppercase hover:bg-navy hover:text-on-navy"
              >
                Call Us
              </a>
            </Reveal>
            <Reveal
              delay={140}
              className="border-t-2 border-[var(--digital)] bg-card p-6 shadow-[0_14px_32px_-26px_rgba(10,20,30,0.4)]"
            >
              <Mail className="h-6 w-6 text-[var(--digital)]" aria-hidden="true" />
              <h2 className="mt-5 font-display text-2xl text-navy">Email Lefa Connect</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                For detailed enquiries and information.
              </p>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="mt-6 inline-flex h-11 items-center justify-center border border-navy px-5 text-xs font-semibold tracking-[0.14em] text-navy uppercase hover:bg-navy hover:text-on-navy"
              >
                Email Us
              </a>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-border">
        <Container>
          <SectionHeading
            eyebrow="What would you like to talk about?"
            title="Start with what matters to you."
          />
          <ul className="mt-10 grid gap-6 border-y border-border sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_REASONS.map(([heading, copy], index) => (
              <Reveal
                as="li"
                key={heading}
                delay={index * 60}
                className="border-b border-border py-6 last:border-b-0 sm:px-5 sm:even:border-l lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <h2 className="font-display text-xl text-navy">{heading}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-heritage">Lefa Connect</p>
            <h2 className="mt-3 font-display text-2xl text-navy">
              We&apos;d love to hear from you.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Reach out through WhatsApp, phone or email and start a conversation with Lefa Connect.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-navy">Office:</strong> {CONTACT_INFO.address}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center bg-[#25D366] px-7 text-xs font-semibold tracking-[0.14em] text-white uppercase hover:bg-[#20bd5a]"
            >
              WhatsApp Us
            </a>
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="inline-flex h-12 items-center justify-center border border-navy px-7 text-xs font-semibold tracking-[0.14em] text-navy uppercase hover:bg-navy hover:text-on-navy"
            >
              Email Us
            </a>
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
