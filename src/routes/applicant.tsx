import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { ResidentialLocationFields } from "@/components/forms/ResidentialLocationFields";
import { privateSeoHead } from "@/lib/seo";
import {
  createApplicationDraft,
  getApplicantWorkspace,
  saveApplicantProfile,
  saveMembershipSelection,
  saveNextOfKin,
  submitJoiningPayment,
  submitApplication,
} from "@/lib/application.server";

const STEPS = [
  "Personal Information",
  "Contact & Residence",
  "Community",
  "Next of Kin",
  "Membership",
  "Documents",
  "Selection",
  "Agreement",
  "Payment",
  "Approval",
];

const LIFECYCLE_STEPS = [
  "Application Submitted",
  "Under Review",
  "Approved",
  "Joining Payment",
  "POP/Payment Verification",
  "Membership Activated",
];

export const Route = createFileRoute("/applicant")({
  head: () => privateSeoHead("Applicant Workspace — Lefa Connect"),
  loader: async () => {
    try {
      return await getApplicantWorkspace();
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: ApplicantWorkspace,
});

function ApplicantWorkspace() {
  const initial = Route.useLoaderData();
  const [workspace, setWorkspace] = useState(initial);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const application = workspace.application;
  const profile = application?.profile ?? null;
  const kin = application?.kin ?? [];
  const selection = application?.selection ?? null;
  const isDraft = application?.status === "DRAFT";
  const lifecycleIndex =
    application?.status === "APPROVED_PENDING_PAYMENT"
      ? 2
      : application?.status === "PAYMENT_PENDING_VERIFICATION"
        ? 4
        : application?.status === "ACTIVE"
          ? 5
          : application?.status === "REJECTED"
            ? 0
            : application?.status === "CHANGES_REQUESTED"
              ? 0
              : 1;
  const statusLabel =
    application?.status === "PENDING_REVIEW"
      ? "Pending Review"
      : application?.status === "APPROVED_PENDING_PAYMENT"
        ? "Approved - Payment Pending"
        : application?.status === "REJECTED"
          ? "Rejected"
          : application?.status === "CHANGES_REQUESTED"
            ? "Changes Requested"
            : application?.status === "PAYMENT_PENDING_VERIFICATION"
              ? "Payment Pending Verification"
              : application?.status === "ACTIVE"
                ? "Active"
                : (application?.status ?? "DRAFT");

  const refresh = async () => setWorkspace(await getApplicantWorkspace());

  const start = async () => {
    setSaving(true);
    try {
      const result = await createApplicationDraft();
      await refresh();
      setMessage(`Draft ${result.reference} created.`);
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const form = new FormData(event.currentTarget);
      await saveApplicantProfile({
        data: Object.fromEntries(form.entries()) as Record<string, string>,
      });
      await refresh();
      setMessage("Profile saved.");
    } finally {
      setSaving(false);
    }
  };

  const saveKinDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const form = new FormData(event.currentTarget);
      await saveNextOfKin({
        data: {
          primary: {
            fullName: String(form.get("primaryName") ?? ""),
            relationship: String(form.get("primaryRelationship") ?? ""),
            mobileNumber: String(form.get("primaryPhone") ?? ""),
          },
          additional: {
            fullName: String(form.get("additionalName") ?? ""),
            relationship: String(form.get("additionalRelationship") ?? ""),
            mobileNumber: String(form.get("additionalPhone") ?? ""),
          },
        },
      });
      await refresh();
      setMessage("Next-of-kin records saved.");
    } finally {
      setSaving(false);
    }
  };

  const saveMembershipDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const category = String(form.get("category") ?? "").trim();
    if (!category) {
      setMessage("Please enter a membership category before saving.");
      return;
    }
    setSaving(true);
    try {
      await saveMembershipSelection({
        data: {
          slotCount: Number(form.get("slotCount") ?? 1),
          category,
          livestockCount: Number(form.get("livestockCount") ?? 0),
          livestockTypes: form.getAll("livestockType").map(String),
          reasonForJoining: String(form.get("reason") ?? ""),
          referralName: String(form.get("referral") ?? ""),
        },
      });
      await refresh();
      setMessage("Membership selection saved.");
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await submitApplication();
      await refresh();
      setMessage("Application submitted. Status: Pending Review.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Complete the required steps before submitting.",
      );
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setPaymentError("");
    try {
      const form = new FormData(event.currentTarget);
      const file = form.get("pop") as File | null;
      if (!file || file.size === 0) throw new Error("Upload proof of payment before submitting.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      await submitJoiningPayment({
        data: {
          paymentReference: String(form.get("paymentReference") ?? ""),
          paymentDate: String(form.get("paymentDate") ?? ""),
          amountPaidCents: Math.round(Number(form.get("amountPaid") ?? 0) * 100),
          popFileName: file.name,
          popMimeType: file.type || "application/octet-stream",
          popSizeBytes: file.size,
          popDataBase64: btoa(binary),
        },
      });
      await refresh();
      setMessage("Payment submitted. Status: Awaiting Verification.");
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Could not submit payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-28 md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-heritage">Applicant workspace</p>

        <div className="mt-4 border-b border-border pb-8">
          <h1 className="font-display text-4xl text-navy">What do you need to do next?</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Complete your application in stages. Progress is saved to your account.
          </p>
          {application ? (
            <div className="mt-4 grid gap-2 text-xs tracking-[0.14em] text-muted-foreground uppercase sm:grid-cols-2">
              <p>
                Reference: <strong className="text-navy">{application.reference}</strong>
              </p>
              <p>
                Status: <strong className="text-navy">{statusLabel}</strong>
              </p>
            </div>
          ) : null}
        </div>

        {message ? (
          <p className="mt-5 border border-border bg-card p-4 text-sm text-navy">{message}</p>
        ) : null}

        {!application ? (
          <button
            onClick={() => void start()}
            className="mt-10 bg-navy px-6 py-4 text-sm font-semibold text-on-navy uppercase"
          >
            {saving ? "Starting…" : "Start application"}
          </button>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="border border-border bg-card p-5">
              <p className="eyebrow text-heritage">Application progress</p>
              {isDraft ? (
                <ol className="mt-5 divide-y divide-border border-y border-border">
                  {STEPS.map((item, index) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => setStep(index)}
                        className="flex w-full gap-3 py-3 text-left text-sm text-navy"
                      >
                        {index < step ? (
                          <Check className="h-4 w-4 text-heritage" />
                        ) : (
                          <span className="w-4 text-center text-xs text-muted-foreground">
                            {index === step ? "→" : "○"}
                          </span>
                        )}
                        {item}
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <ol className="mt-5 divide-y divide-border border-y border-border">
                  {LIFECYCLE_STEPS.map((item, index) => (
                    <li key={item} className="flex gap-3 py-3 text-sm text-navy">
                      {index < lifecycleIndex ? (
                        <Check className="h-4 w-4 text-heritage" />
                      ) : (
                        <span className="w-4 text-center text-xs text-muted-foreground">
                          {index === lifecycleIndex ? "→" : "○"}
                        </span>
                      )}
                      {item}
                    </li>
                  ))}
                </ol>
              )}
            </aside>

            <section className="border border-border bg-card p-5 md:p-8">
              {!isDraft ? (
                <div>
                  <h2 className="font-display text-3xl text-navy">Application Submitted</h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {application.status === "ACTIVE"
                      ? "Your Lefa Connect application has been approved and your membership is now active."
                      : "Thank you for applying to Lefa Connect. Your application has been successfully received and is being processed."}
                  </p>
                  <dl className="mt-8 grid gap-4 border-y border-border py-5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Application reference</dt>
                      <dd className="mt-1 font-semibold text-navy">{application.reference}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Application status</dt>
                      <dd className="mt-1 font-semibold text-navy">{statusLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Memberships</dt>
                      <dd className="mt-1 font-semibold text-navy">
                        {selection?.slotCount ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Shares</dt>
                      <dd className="mt-1 font-semibold text-navy">
                        {selection?.shareCount ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Joining fee</dt>
                      <dd className="mt-1 font-semibold text-navy">
                        {selection ? `R${(selection.joiningFeeCents / 100).toLocaleString()}` : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Monthly contribution</dt>
                      <dd className="mt-1 font-semibold text-navy">
                        {selection
                          ? `R${(selection.monthlyContributionCents / 100).toLocaleString()}`
                          : "-"}
                      </dd>
                    </div>
                  </dl>
                  {application.status === "ACTIVE" && application.membership ? (
                    <div className="mt-8 border-t border-border pt-6">
                      <p className="eyebrow text-heritage">Membership active</p>
                      <h3 className="mt-2 font-display text-2xl text-navy">
                        Your Lefa Connect membership is active
                      </h3>
                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-muted-foreground">Member number</dt>
                          <dd className="font-semibold text-navy">
                            {application.membership.membershipNumber}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Membership status</dt>
                          <dd className="font-semibold text-navy">
                            {application.membership.status}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Selected membership</dt>
                          <dd className="font-semibold text-navy">
                            {application.membershipCategory ?? "-"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Shares / shareholding</dt>
                          <dd className="font-semibold text-navy">
                            {selection?.shareCount ?? "-"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Joining fee</dt>
                          <dd className="font-semibold text-navy">Paid</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Monthly contribution</dt>
                          <dd className="font-semibold text-navy">
                            {selection
                              ? `R${(selection.monthlyContributionCents / 100).toLocaleString()}`
                              : "-"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Activation date</dt>
                          <dd className="font-semibold text-navy">
                            {application.membership.activatedAt
                              ? new Date(application.membership.activatedAt).toLocaleDateString()
                              : "-"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Payment reference</dt>
                          <dd className="font-semibold text-navy">
                            {application.payment?.paymentReference ?? "-"}
                          </dd>
                        </div>
                      </dl>
                      <Link
                        to="/dashboard"
                        className="mt-6 inline-flex bg-navy px-5 py-3 text-sm font-semibold text-on-navy uppercase"
                      >
                        Go to Member Dashboard
                      </Link>
                    </div>
                  ) : null}
                  {application.status === "APPROVED_PENDING_PAYMENT" && !application.payment ? (
                    <form
                      onSubmit={(event) => void submitPayment(event)}
                      className="mt-8 border-t border-border pt-6"
                    >
                      <p className="eyebrow text-heritage">Joining payment</p>
                      <h3 className="mt-2 font-display text-2xl text-navy">
                        Submit your joining payment
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Amount due:{" "}
                        <strong className="text-navy">
                          R{selection ? (selection.joiningFeeCents / 100).toLocaleString() : "-"}
                        </strong>
                      </p>
                      <p className="mt-3 border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground">
                        Payment instructions: use your approved application reference as the payment
                        reference and retain your proof of payment for verification.
                      </p>
                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <label className="space-y-2 text-sm text-navy">
                          <span>Amount paid</span>
                          <input
                            name="amountPaid"
                            type="number"
                            min="0.01"
                            step="0.01"
                            defaultValue={selection ? selection.joiningFeeCents / 100 : ""}
                            required
                            className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-navy">
                          <span>Payment date</span>
                          <input
                            name="paymentDate"
                            type="date"
                            required
                            className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-navy sm:col-span-2">
                          <span>Payment reference</span>
                          <input
                            name="paymentReference"
                            required
                            defaultValue={application.reference}
                            className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-navy sm:col-span-2">
                          <span>Proof of payment</span>
                          <input
                            name="pop"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                            className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                          />
                        </label>
                      </div>
                      {paymentError ? (
                        <p className="mt-4 text-sm text-red-700" role="alert">
                          {paymentError}
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        disabled={saving}
                        className="mt-5 bg-heritage px-5 py-3 text-sm font-semibold text-on-navy uppercase disabled:opacity-60"
                      >
                        {saving ? "Submitting…" : "Submit Payment / Submit Proof"}
                      </button>
                    </form>
                  ) : application.payment ? (
                    <div className="mt-8 border-t border-border pt-6">
                      <p className="eyebrow text-heritage">Payment submitted</p>
                      <h3 className="mt-2 font-display text-2xl text-navy">
                        {application.payment.status === "VERIFIED"
                          ? "Payment Verified"
                          : "Payment Submitted — Awaiting Verification"}
                      </h3>
                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-muted-foreground">Payment status</dt>
                          <dd className="font-semibold text-navy">{application.payment.status}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Payment reference</dt>
                          <dd className="font-semibold text-navy">
                            {application.payment.paymentReference}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Amount paid</dt>
                          <dd className="font-semibold text-navy">
                            R{(application.payment.amountPaidCents / 100).toLocaleString()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">POP</dt>
                          <dd className="font-semibold text-navy">
                            {application.payment.popFileName}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ) : null}
                </div>
              ) : (
                step <= 2 && (
                  <form onSubmit={(event) => void saveProfile(event)}>
                    <h2 className="font-display text-3xl text-navy">{STEPS[step]}</h2>
                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-navy">
                        <span>First name</span>
                        <input
                          name="firstName"
                          defaultValue={profile?.firstName ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>Middle name</span>
                        <input
                          name="middleName"
                          defaultValue={profile?.middleName ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>Last name</span>
                        <input
                          name="lastName"
                          defaultValue={profile?.lastName ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>ID / Passport number</span>
                        <input
                          name="idOrPassportNumber"
                          defaultValue={profile?.idOrPassportNumber ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>Date of birth</span>
                        <input
                          name="dateOfBirth"
                          type="date"
                          defaultValue={profile?.dateOfBirth ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>Gender</span>
                        <input
                          name="gender"
                          defaultValue={profile?.gender ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy sm:col-span-2">
                        <span>Email</span>
                        <input
                          name="email"
                          type="email"
                          defaultValue={profile?.email ?? workspace.user?.email ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>Mobile number</span>
                        <input
                          name="mobileNumber"
                          defaultValue={profile?.mobileNumber ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>Alternative phone</span>
                        <input
                          name="alternativePhone"
                          defaultValue={profile?.alternativePhone ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <ResidentialLocationFields
                        defaultCountry={profile?.country ?? ""}
                        defaultRegion={profile?.regionOrProvinceState ?? ""}
                        defaultDistrict={profile?.districtOrCity ?? ""}
                        addressName="residentialAddress"
                        addressDefaultValue={profile?.residentialAddress ?? ""}
                        applicantWorkspace
                      />
                      <label className="space-y-2 text-sm text-navy">
                        <span>Village</span>
                        <input
                          name="village"
                          defaultValue={profile?.village ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>Chief / traditional authority</span>
                        <input
                          name="chiefOrTraditionalAuthority"
                          defaultValue={profile?.chiefOrTraditionalAuthority ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>Ward</span>
                        <input
                          name="ward"
                          defaultValue={profile?.ward ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-navy">
                        <span>Municipality</span>
                        <input
                          name="municipality"
                          defaultValue={profile?.municipality ?? ""}
                          className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </label>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-navy px-6 py-3 text-sm font-semibold text-on-navy uppercase"
                      >
                        {saving ? "Saving…" : "Save profile"}
                      </button>
                    </div>
                  </form>
                )
              )}

              {isDraft && step === 3 && (
                <form onSubmit={(event) => void saveKinDetails(event)}>
                  <h2 className="font-display text-3xl text-navy">{STEPS[step]}</h2>
                  <div className="mt-8 space-y-8">
                    <div className="space-y-4 rounded-xl border border-border p-4">
                      <h3 className="font-display text-2xl text-navy">Primary next of kin</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          name="primaryName"
                          defaultValue={kin[0]?.fullName ?? ""}
                          placeholder="Full name"
                          className="border border-input bg-transparent px-3 py-2 text-sm"
                        />
                        <input
                          name="primaryRelationship"
                          defaultValue={kin[0]?.relationship ?? ""}
                          placeholder="Relationship"
                          className="border border-input bg-transparent px-3 py-2 text-sm"
                        />
                        <input
                          name="primaryPhone"
                          defaultValue={kin[0]?.mobileNumber ?? ""}
                          placeholder="Mobile number"
                          className="border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 rounded-xl border border-border p-4">
                      <h3 className="font-display text-2xl text-navy">Additional next of kin</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          name="additionalName"
                          defaultValue={kin[1]?.fullName ?? ""}
                          placeholder="Full name"
                          className="border border-input bg-transparent px-3 py-2 text-sm"
                        />
                        <input
                          name="additionalRelationship"
                          defaultValue={kin[1]?.relationship ?? ""}
                          placeholder="Relationship"
                          className="border border-input bg-transparent px-3 py-2 text-sm"
                        />
                        <input
                          name="additionalPhone"
                          defaultValue={kin[1]?.mobileNumber ?? ""}
                          placeholder="Mobile number"
                          className="border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-navy px-6 py-3 text-sm font-semibold text-on-navy uppercase"
                    >
                      {saving ? "Saving…" : "Save next of kin"}
                    </button>
                  </div>
                </form>
              )}

              {isDraft && step === 4 && (
                <form onSubmit={(event) => void saveMembershipDetails(event)}>
                  <h2 className="font-display text-3xl text-navy">{STEPS[step]}</h2>
                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-navy">
                      <span>Slot count</span>
                      <input
                        name="slotCount"
                        type="number"
                        min="1"
                        max="4"
                        defaultValue={selection?.slotCount ?? 1}
                        className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-navy">
                      <span>
                        Membership category <span className="text-heritage">*</span>
                      </span>
                      <input
                        name="category"
                        required
                        defaultValue={application?.membershipCategory ?? ""}
                        className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-navy">
                      <span>Livestock count</span>
                      <input
                        name="livestockCount"
                        type="number"
                        min="0"
                        defaultValue={0}
                        className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-navy">
                      <span>Referral name</span>
                      <input
                        name="referral"
                        defaultValue={application?.referralName ?? ""}
                        className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-navy sm:col-span-2">
                      <span>Livestock types</span>
                      <input
                        name="livestockType"
                        defaultValue={selection?.livestockTypes?.join(", ") ?? ""}
                        placeholder="Cattle, goats, sheep"
                        className="w-full border border-input bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-navy sm:col-span-2">
                      <span>Reason for joining</span>
                      <textarea
                        name="reason"
                        defaultValue={application?.reasonForJoining ?? ""}
                        className="min-h-28 w-full border border-input bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-navy px-6 py-3 text-sm font-semibold text-on-navy uppercase"
                    >
                      {saving ? "Saving…" : "Save membership"}
                    </button>
                  </div>
                </form>
              )}

              {isDraft && step > 4 && (
                <div>
                  <h2 className="font-display text-3xl text-navy">{STEPS[step]}</h2>
                  <p className="mt-4 text-sm text-muted-foreground">
                    This step is ready for the remaining application workflow. Complete the required
                    details in the previous stages, then submit when all sections are marked
                    complete.
                  </p>
                  <div className="mt-8 flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setStep((current) => Math.max(0, current - 1))}
                      className="border border-input px-4 py-2 text-sm text-navy"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => void submit()}
                      disabled={saving}
                      className="bg-heritage px-5 py-3 text-sm font-semibold text-on-navy uppercase"
                    >
                      {saving ? "Submitting…" : "Submit application"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
