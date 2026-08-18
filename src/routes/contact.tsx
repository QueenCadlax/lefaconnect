import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Container, Placeholder, Section } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaButton } from "@/components/ui/lefa-button";
import { Field, Textarea, TextInput } from "@/components/forms/fields";

const title = "Contact — LEFA CONNECT";
const description =
  "Get in touch with Lefa Connect about membership, livestock, projects or partnership enquiries.";

export const Route = createFileRoute("/contact")({
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
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Let's start a conversation."
        intro="Send an enquiry and the Lefa Connect team will respond through the confirmed office channels."
      />

      <Section tone="ivory">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl text-navy">Office details</h2>
            <ul className="mt-8 divide-y divide-border border-y border-border text-sm">
              <li className="flex gap-4 py-5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-heritage" aria-hidden="true" />
                <span className="text-muted-foreground">
                  Head office address
                  <Placeholder>To confirm</Placeholder>
                </span>
              </li>
              <li className="flex gap-4 py-5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-heritage" aria-hidden="true" />
                <span className="text-muted-foreground">
                  Telephone number
                  <Placeholder>To confirm</Placeholder>
                </span>
              </li>
              <li className="flex gap-4 py-5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-heritage" aria-hidden="true" />
                <span className="text-muted-foreground">
                  Email address
                  <Placeholder>To confirm</Placeholder>
                </span>
              </li>
            </ul>
            <p className="mt-8 text-sm text-muted-foreground">
              Office hours and regional offices
              <Placeholder>To confirm</Placeholder>
            </p>
          </div>

          <div className="lg:col-span-7">
            {sent ? (
              <Reveal className="border border-border bg-card p-10">
                <p className="eyebrow text-heritage">Enquiry captured</p>
                <h2 className="mt-4 font-display text-3xl text-navy">Thank you.</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Your message has been captured in this interface. Delivery and routing
                  will be enabled when the contact channel is connected to the Lefa
                  Connect platform.
                </p>
                <LefaButton className="mt-8" variant="outline" onClick={() => setSent(false)}>
                  Send another message
                </LefaButton>
              </Reveal>
            ) : (
              <form
                className="border border-border bg-card p-8 md:p-10"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSent(true);
                }}
              >
                <h2 className="font-display text-2xl text-navy">Send an enquiry</h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <Field id="contact-name" label="Full name" required>
                    <TextInput id="contact-name" name="name" required autoComplete="name" />
                  </Field>
                  <Field id="contact-email" label="Email address" required>
                    <TextInput
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                    />
                  </Field>
                  <Field id="contact-phone" label="Phone number">
                    <TextInput id="contact-phone" name="phone" type="tel" autoComplete="tel" />
                  </Field>
                  <Field id="contact-subject" label="Subject">
                    <TextInput id="contact-subject" name="subject" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field id="contact-message" label="Message" required>
                      <Textarea id="contact-message" name="message" rows={6} required />
                    </Field>
                  </div>
                </div>
                <LefaButton type="submit" className="mt-8 w-full sm:w-auto" size="lg">
                  Send Message
                </LefaButton>
              </form>
            )}
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
