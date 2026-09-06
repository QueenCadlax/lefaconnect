import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, UploadCloud } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Container } from "@/components/site/Section";
import { Reveal } from "@/components/site/Reveal";
import { LefaButton, LefaLink } from "@/components/ui/lefa-button";
import { Field, Select, Textarea, TextInput } from "@/components/forms/fields";
import { ResidentialLocationFields } from "@/components/forms/ResidentialLocationFields";
import { submitPublicApplication } from "@/lib/application.server";
import { publicSeoHead } from "@/lib/seo";

const STEPS = [
  "Personal",
  "Contact",
  "Community",
  "Membership & Participation",
  "Documents",
  "Next of kin",
  "Consent",
];

const MEMBERSHIP_SELECTIONS = [
  { count: 1, shares: 10, joiningFee: 2500, monthlyContribution: 500 },
  { count: 2, shares: 20, joiningFee: 5000, monthlyContribution: 1000 },
  { count: 3, shares: 30, joiningFee: 5000, monthlyContribution: 1500 },
  { count: 4, shares: 40, joiningFee: 7500, monthlyContribution: 2000 },
] as const;

export const Route = createFileRoute("/apply")({
  head: () =>
    publicSeoHead(
      "Apply for Membership — Lefa Connect",
      "Start your Lefa Connect membership application and join a connected agricultural community.",
      "/apply",
    ),
  component: ApplyPage,
});

function ApplyPage() {
  const [step, setStep] = useState(0);
  const [applicationData, setApplicationData] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<{ reference: string; status: string } | null>(null);
  const [submissionError, setSubmissionError] = useState("");

  if (submission) {
    return (
      <SiteShell>
        <main className="bg-[var(--ivory)] pt-20">
          <Container className="py-16 md:py-24">
            <Reveal className="mx-auto max-w-2xl border border-border bg-card p-8 text-center md:p-14">
              <CheckCircle2 className="mx-auto h-10 w-10 text-heritage" aria-hidden="true" />
              <p className="eyebrow mt-6 text-heritage">Application received</p>
              <h1 className="mt-4 font-display text-[2.5rem] leading-tight text-navy">
                Thank you for applying to Lefa Connect.
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Your application has been successfully received and is now under review.
              </p>
              <dl className="mx-auto mt-8 max-w-md border-y border-border py-5 text-left text-sm">
                <div className="flex justify-between gap-4 py-2">
                  <dt>Application reference</dt>
                  <dd className="font-semibold text-navy">{submission.reference}</dd>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <dt>Status</dt>
                  <dd className="font-semibold text-navy">Pending Review</dd>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <dt>Selected memberships</dt>
                  <dd className="font-semibold text-navy">{applicationData.slotCount}</dd>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <dt>Shares</dt>
                  <dd className="font-semibold text-navy">
                    {Number(applicationData.slotCount) * 10}
                  </dd>
                </div>
              </dl>
              <div className="mt-9 flex justify-center gap-3">
                <LefaLink to="/" variant="outline">
                  Return Home
                </LefaLink>
                <LefaLink to="/contact" variant="primary">
                  Contact Lefa Connect
                </LefaLink>
              </div>
            </Reveal>
          </Container>
        </main>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <main className="bg-background pt-20">
        <Container className="grid min-w-0 gap-10 py-10 md:py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:py-20">
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-heritage">Lefa Connect</p>
            <h1 className="mt-5 max-w-md font-display text-[2.7rem] leading-[1.02] text-navy md:text-[3.5rem]">
              Membership application
            </h1>
            <p className="mt-6 max-w-md text-lg text-navy">Your membership journey starts here.</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              The information you provide helps establish and maintain your official membership
              record.
            </p>
            <ol className="mt-10 border-t border-border">
              {["Identity", "Community", "Participation", "Records"].map((item, index) => (
                <li
                  key={item}
                  className="grid grid-cols-[2rem_1fr] gap-3 border-b border-border py-4"
                >
                  <span className="font-display text-lg text-[var(--gold)]">0{index + 1}</span>
                  <span className="text-sm text-navy">{item}</span>
                </li>
              ))}
            </ol>
          </aside>

          <Reveal className="min-w-0 border border-[color-mix(in_oklab,var(--heritage)_22%,var(--border))] bg-card p-5 shadow-[0_20px_50px_-34px_rgba(10,20,30,0.35)] md:p-8">
            <ol className="flex flex-wrap border-b border-border">
              {STEPS.map((label, index) => (
                <li key={label} className="min-w-[5rem] flex-1">
                  <button
                    type="button"
                    onClick={() => setStep(index)}
                    className={`w-full border-b-2 px-2 pb-4 text-center ${index === step ? "border-heritage" : "border-transparent"}`}
                  >
                    <span className="font-display text-lg text-heritage">0{index + 1}</span>
                    <span className="mt-1 block text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                      {label}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <ApplicationStep
              step={step}
              onComplete={(data) => {
                setApplicationData((current) => ({ ...current, ...data }));
                setStep(Math.min(step + 1, STEPS.length - 1));
              }}
              onSubmit={async (data) => {
                const complete = { ...applicationData, ...data };
                setApplicationData(complete);
                setSubmissionError("");
                if (complete.password !== complete.passwordConfirmation) {
                  setSubmissionError("Passwords do not match.");
                  return;
                }
                const accountResponse = await fetch("/api/auth/sign-up/email", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    name: `${complete.firstName} ${complete.lastName}`.trim(),
                    email: complete.email,
                    password: complete.password,
                  }),
                });
                if (!accountResponse.ok) {
                  setSubmissionError(
                    "We could not create your account. This email may already be registered.",
                  );
                  return;
                }
                try {
                  const result = await submitPublicApplication({
                    data: {
                      ...complete,
                      slotCount: Number(complete.slotCount),
                    } as Parameters<typeof submitPublicApplication>[0]["data"],
                  });
                  window.location.href = "/applicant";
                } catch (error) {
                  setSubmissionError(
                    error instanceof Error
                      ? error.message
                      : "We could not submit your application.",
                  );
                }
              }}
            />
            {submissionError ? (
              <p className="mt-4 text-sm text-red-700" role="alert">
                {submissionError}
              </p>
            ) : null}
          </Reveal>
        </Container>
      </main>
    </SiteShell>
  );
}

function ApplicationStep({
  step,
  onComplete,
  onSubmit,
}: {
  step: number;
  onComplete: (data: Record<string, string>) => void;
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
}) {
  const headings = [
    [
      "01",
      "Personal information",
      "Provide the personal details required to establish your official membership record.",
    ],
    ["02", "Contact information", "Tell us how to reach you and where you are based."],
    [
      "03",
      "Community information",
      "Provide the community information relevant to your place of residence and membership.",
    ],
    [
      "04",
      "Membership information",
      "Tell us about your intended participation within Lefa Connect.",
    ],
    [
      "05",
      "Supporting documents",
      "Documents help establish identity, residence and accurate organisational records.",
    ],
    ["06", "Next of kin", "Provide trusted contacts who may be contacted where necessary."],
    ["07", "Terms and consent", "Review these declarations before submitting your application."],
  ];
  const [number, title, copy] = headings[step]!;
  return (
    <form
      className="mt-10"
      onSubmit={(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<
          string,
          string
        >;
        if (step === STEPS.length - 1) {
          onSubmit(data);
        } else {
          onComplete(data);
        }
      }}
    >
      <div className="mb-8 flex min-w-0 gap-4 border-b border-border pb-6">
        <span className="font-display text-2xl text-[var(--gold)]">{number}</span>
        <div className="min-w-0">
          <h2 className="font-display text-2xl text-navy md:text-[2rem]">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
        </div>
      </div>
      {step === 0 && <PersonalFields />}
      {step === 1 && <ContactFields />}
      {step === 2 && <CommunityFields />}
      {step === 3 && <MembershipFields />}
      {step === 4 && <DocumentFields />}
      {step === 5 && <KinFields />}
      {step === 6 && <ConsentFields />}
      <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex h-12 items-center gap-2 px-3 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <LefaButton type="submit">
          {step === STEPS.length - 1 ? "Submit Application" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </LefaButton>
      </div>
    </form>
  );
}

function PersonalFields() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="firstName" label="First name" required>
        <TextInput id="firstName" name="firstName" required autoComplete="given-name" />
      </Field>
      <Field id="middleName" label="Middle name">
        <TextInput id="middleName" name="middleName" />
      </Field>
      <Field id="lastName" label="Last name" required>
        <TextInput id="lastName" name="lastName" required autoComplete="family-name" />
      </Field>
      <Field id="idNumber" label="ID / Passport number" required>
        <TextInput id="idNumber" name="idNumber" required />
      </Field>
      <Field id="dateOfBirth" label="Date of birth" required>
        <TextInput
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          required
        />
      </Field>
      <Field id="gender" label="Gender">
        <Select id="gender" name="gender">
          <option>Prefer not to say</option>
          <option>Female</option>
          <option>Male</option>
        </Select>
      </Field>
    </div>
  );
}
function ContactFields() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="email" label="Email address" required>
        <TextInput id="email" name="email" type="email" required autoComplete="email" />
      </Field>
      <Field id="phone" label="Mobile number" required>
        <TextInput id="phone" name="phone" type="tel" required autoComplete="tel" />
      </Field>
      <Field id="alternativePhone" label="Alternative phone number">
        <TextInput id="alternativePhone" name="alternativePhone" type="tel" />
      </Field>
      <ResidentialLocationFields />
      <Field id="preferredContact" label="Preferred contact method" required>
        <Select id="preferredContact" required>
          <option value="">Select a method</option>
          <option>Phone</option>
          <option>WhatsApp</option>
          <option>SMS</option>
          <option>Email</option>
        </Select>
      </Field>
    </div>
  );
}
function CommunityFields() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="village" label="Village / Community">
        <TextInput id="village" name="village" />
      </Field>
      <Field
        id="authority"
        label="Chief / Traditional Authority"
        hint="Optional — where applicable."
      >
        <TextInput id="authority" name="authority" />
      </Field>
      <Field id="ward" label="Ward">
        <TextInput id="ward" name="ward" />
      </Field>
      <Field id="municipality" label="Municipality / Local Authority">
        <TextInput id="municipality" name="municipality" />
      </Field>
    </div>
  );
}
function MembershipFields() {
  const [selectedCount, setSelectedCount] = useState(1);
  const selection = MEMBERSHIP_SELECTIONS[selectedCount - 1]!;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2 border border-border bg-background p-5">
        <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-navy uppercase">
          Membership interest / selection
        </p>
        <h3 className="mt-2 font-display text-2xl text-navy">Lefa Connect share membership</h3>
        <label className="mt-5 block text-sm text-navy">
          <span className="font-semibold">Memberships of interest</span>
          <select
            name="slotCount"
            value={selectedCount}
            onChange={(event) => setSelectedCount(Number(event.target.value))}
            className="mt-2 h-12 w-full border border-input bg-card px-4 text-sm"
          >
            {MEMBERSHIP_SELECTIONS.map((option) => (
              <option key={option.count} value={option.count}>
                {option.count} {option.count === 1 ? "membership" : "memberships"}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="category" value="Lefa Connect share membership" />
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Selected memberships</dt>
            <dd className="mt-1 font-semibold text-navy">{selection.count}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Share allocation</dt>
            <dd className="mt-1 font-semibold text-navy">{selection.shares} shares</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Joining fee</dt>
            <dd className="mt-1 font-semibold text-navy">
              R{selection.joiningFee.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Monthly contribution</dt>
            <dd className="mt-1 font-semibold text-navy">R{selection.monthlyContribution}</dd>
          </div>
        </dl>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          This is your stated membership interest at application stage. The joining fee is
          non-refundable where applicable; the third membership has no additional joining fee.
          Applying does not confirm payment, approval or issue shares. Share allocation remains
          subject to approval and official recording.
        </p>
      </div>
      <Field id="reason" label="Reason for joining" required className="sm:col-span-2">
        <Textarea
          id="reason"
          name="reason"
          rows={5}
          required
          placeholder="Tell us briefly why you would like to join Lefa Connect."
        />
      </Field>
    </div>
  );
}
function DocumentFields() {
  return (
    <div className="space-y-5">
      <DocumentUpload label="Proof of identity" required />
      <DocumentUpload
        label="Proof of residence"
        required
        hint="Examples may include a municipal statement, utility bill, official correspondence or other accepted proof of residence."
      />
      <DocumentUpload label="Additional supporting documents" />
      <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-heritage" />
        Documents are collected for membership administration and verification purposes.
      </p>
    </div>
  );
}
function DocumentUpload({
  label,
  required,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[0.7rem] font-semibold tracking-[0.14em] text-navy uppercase">
        {label}
        {required ? <span className="ml-1 text-heritage">*</span> : null}
      </p>
      {hint ? <p className="mb-3 text-xs text-muted-foreground">{hint}</p> : null}
      <label className="flex cursor-pointer items-center gap-4 border border-dashed border-input bg-background p-5 hover:border-heritage">
        <UploadCloud className="h-6 w-6 text-heritage" />
        <span>
          <strong className="block text-sm text-navy">Browse files</strong>
          <span className="text-xs text-muted-foreground">
            PDF, JPG or PNG · Maximum 10 MB per file
          </span>
        </span>
        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="sr-only" />
      </label>
    </div>
  );
}
function KinFields() {
  return (
    <div className="space-y-8">
      <KinGroup label="Primary next of kin — required" required />
      <KinGroup label="Additional next of kin — optional" />
    </div>
  );
}
function KinGroup({ label, required }: { label: string; required?: boolean }) {
  return (
    <fieldset className="border-t border-border pt-6">
      <legend className="text-sm font-semibold text-navy">{label}</legend>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field id={`${label}-name`} label="Full name" required={required}>
          <TextInput
            id={`${label}-name`}
            name={label.startsWith("Primary") ? "primaryName" : "additionalName"}
            required={required}
          />
        </Field>
        <Field id={`${label}-relationship`} label="Relationship" required={required}>
          <Select
            id={`${label}-relationship`}
            name={label.startsWith("Primary") ? "primaryRelationship" : "additionalRelationship"}
            required={required}
          >
            <option value="">Select relationship</option>
            {["Spouse", "Parent", "Child", "Sibling", "Relative", "Other"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
        <Field id={`${label}-phone`} label="Mobile number" required={required}>
          <TextInput
            id={`${label}-phone`}
            name={label.startsWith("Primary") ? "primaryPhone" : "additionalPhone"}
            type="tel"
            required={required}
          />
        </Field>
        <Field id={`${label}-alternative`} label="Alternative contact number">
          <TextInput id={`${label}-alternative`} type="tel" />
        </Field>
        <Field id={`${label}-address`} label="Residential address" className="sm:col-span-2">
          <Textarea id={`${label}-address`} rows={2} />
        </Field>
      </div>
    </fieldset>
  );
}
function ConsentFields() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      {[
        "I confirm that the information provided is true and accurate to the best of my knowledge.",
        "I acknowledge that membership is subject to the Lefa Connect governing documents and approval process.",
        "I consent to information and documents being processed for membership administration and verification.",
        "I consent to being contacted regarding my membership and related organisational matters.",
      ].map((copy) => (
        <label key={copy} className="flex items-start gap-3">
          <input
            name="consent"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-[var(--heritage)]"
          />
          <span>{copy}</span>
        </label>
      ))}
      <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
        <Field id="applicationPassword" label="Create account password" required>
          <TextInput
            id="applicationPassword"
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </Field>
        <Field id="applicationPasswordConfirmation" label="Confirm password" required>
          <TextInput
            id="applicationPasswordConfirmation"
            name="passwordConfirmation"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </Field>
      </div>
      <p className="pt-3 text-xs">
        Review the Privacy Policy, Terms of Use and membership governance documents before
        submitting.
      </p>
    </div>
  );
}
function Confirmation({ reference }: { reference: string }) {
  return (
    <main className="bg-background pt-20">
      <Container className="py-16 md:py-24">
        <Reveal className="mx-auto max-w-2xl border border-border bg-card p-8 text-center md:p-14">
          <CheckCircle2 className="mx-auto h-10 w-10 text-heritage" />
          <p className="eyebrow mt-6 text-heritage">Application received</p>
          <h1 className="mt-4 font-display text-[2.5rem] text-navy">
            Thank you for applying to Lefa Connect.
          </h1>
          <p className="mt-5 text-sm text-muted-foreground">
            Your application has been submitted for review. {reference}
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <LefaLink to="/" variant="outline">
              Return Home
            </LefaLink>
            <LefaLink to="/contact" variant="primary">
              Contact Lefa Connect
            </LefaLink>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
