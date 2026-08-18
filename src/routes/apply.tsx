import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Container, Placeholder, Section } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaButton, LefaLink } from "@/components/ui/lefa-button";
import { Field, FieldsetBlock, Select, Textarea, TextInput } from "@/components/forms/fields";

const title = "Apply for Membership — LEFA CONNECT";
const description =
  "Start your Lefa Connect membership application. Submit personal, contact and membership information for review.";

export const Route = createFileRoute("/apply")({
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
  component: ApplyPage,
});

function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Apply"
        title="Become a member of Lefa Connect."
        intro="Complete the application below. The form is structured so that additional requirements can be added once membership rules are confirmed."
      />

      <Section tone="ivory">
        <Container className="max-w-4xl">
          {submitted ? (
            <Reveal className="border border-border bg-card p-10 text-center md:p-14">
              <CheckCircle2 className="mx-auto h-10 w-10 text-heritage" aria-hidden="true" />
              <h2 className="mt-6 font-display text-3xl text-navy md:text-4xl">
                Application received
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Thank you for your interest in Lefa Connect. Your details have been
                captured in this interface only — submission, review and approval will be
                enabled when the secure member platform is connected.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Reference number and review timeline
                <Placeholder>To confirm</Placeholder>
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <LefaLink to="/" variant="outline">
                  Return to website
                </LefaLink>
                <LefaButton variant="primary" onClick={() => setSubmitted(false)}>
                  Start another application
                </LefaButton>
              </div>
            </Reveal>
          ) : (
            <form
              className="space-y-12 border border-border bg-card p-8 md:p-12"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <FieldsetBlock legend="Personal information" step="01">
                <Field id="first-name" label="First name" required>
                  <TextInput id="first-name" name="firstName" required autoComplete="given-name" />
                </Field>
                <Field id="last-name" label="Last name" required>
                  <TextInput id="last-name" name="lastName" required autoComplete="family-name" />
                </Field>
                <Field id="id-number" label="ID / passport number" hint="Placeholder field — verification rules to be confirmed.">
                  <TextInput id="id-number" name="idNumber" />
                </Field>
                <Field id="dob" label="Date of birth">
                  <TextInput id="dob" name="dateOfBirth" type="date" />
                </Field>
              </FieldsetBlock>

              <FieldsetBlock legend="Contact information" step="02">
                <Field id="email" label="Email address" required>
                  <TextInput id="email" name="email" type="email" required autoComplete="email" />
                </Field>
                <Field id="phone" label="Mobile number" required>
                  <TextInput id="phone" name="phone" type="tel" required autoComplete="tel" />
                </Field>
                <Field id="address" label="Residential address" className="sm:col-span-2">
                  <Textarea id="address" name="address" rows={3} />
                </Field>
                <Field id="region" label="Region / district" hint="Placeholder list — regions to be confirmed.">
                  <Select id="region" name="region" defaultValue="">
                    <option value="" disabled>
                      Select a region
                    </option>
                    <option value="region-a">Region A (placeholder)</option>
                    <option value="region-b">Region B (placeholder)</option>
                    <option value="region-c">Region C (placeholder)</option>
                  </Select>
                </Field>
                <Field id="preferred-contact" label="Preferred contact method">
                  <Select id="preferred-contact" name="preferredContact" defaultValue="email">
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                  </Select>
                </Field>
              </FieldsetBlock>

              <FieldsetBlock legend="Membership information" step="03">
                <Field id="category" label="Membership category" hint="Placeholder categories — to be confirmed by the organisation.">
                  <Select id="category" name="category" defaultValue="">
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="individual">Individual (placeholder)</option>
                    <option value="household">Household (placeholder)</option>
                    <option value="farm">Farm / enterprise (placeholder)</option>
                  </Select>
                </Field>
                <Field id="livestock-count" label="Approximate livestock held" hint="Optional — indicative only.">
                  <TextInput id="livestock-count" name="livestockCount" type="number" min={0} />
                </Field>
                <Field id="motivation" label="Reason for joining" className="sm:col-span-2">
                  <Textarea id="motivation" name="motivation" rows={4} />
                </Field>
              </FieldsetBlock>

              <fieldset className="border-t border-border pt-8">
                <legend className="sr-only">Supporting documents</legend>
                <div className="mb-7 flex items-baseline gap-4">
                  <span className="font-display text-lg text-[var(--gold)]">04</span>
                  <h2 className="font-display text-2xl text-navy">Supporting documents</h2>
                </div>
                <label
                  htmlFor="documents"
                  className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-input bg-background px-6 py-12 text-center transition-colors hover:border-heritage"
                >
                  <UploadCloud className="h-6 w-6 text-heritage" aria-hidden="true" />
                  <span className="mt-4 text-sm font-medium text-navy">
                    Upload identification or supporting documents
                  </span>
                  <span className="mt-2 text-xs text-muted-foreground">
                    Upload placeholder — secure storage will be connected later.
                  </span>
                  <input id="documents" name="documents" type="file" multiple className="sr-only" />
                </label>
              </fieldset>

              <fieldset className="border-t border-border pt-8">
                <legend className="sr-only">Terms and consent</legend>
                <div className="mb-7 flex items-baseline gap-4">
                  <span className="font-display text-lg text-[var(--gold)]">05</span>
                  <h2 className="font-display text-2xl text-navy">Terms and consent</h2>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="terms"
                      required
                      className="mt-1 h-4 w-4 accent-[var(--heritage)]"
                    />
                    <span>
                      I confirm the information provided is accurate and I accept the Lefa
                      Connect membership terms.
                      <Placeholder>Terms to confirm</Placeholder>
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="dataConsent"
                      className="mt-1 h-4 w-4 accent-[var(--heritage)]"
                    />
                    <span>
                      I consent to my information being processed for membership
                      administration.
                    </span>
                  </label>
                </div>
              </fieldset>

              <div className="border-t border-border pt-8">
                <LefaButton type="submit" size="lg" className="w-full sm:w-auto">
                  Submit Application
                </LefaButton>
                <p className="mt-4 text-xs text-muted-foreground">
                  This form is not yet connected to a database. No data is stored or
                  transmitted.
                </p>
              </div>
            </form>
          )}
        </Container>
      </Section>
    </SiteShell>
  );
}
