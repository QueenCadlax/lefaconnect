import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Home,
  Landmark,
  MessageCircle,
  Sprout,
  UserRound,
} from "lucide-react";
import { getMemberDashboard } from "@/lib/application.server";
import {
  getMemberCommunication,
  getVoiceMessage,
  markCommunicationRead,
  sendMemberMessage,
} from "@/lib/communication.server";
import {
  PortalEmptyState,
  PortalMetric,
  PortalSection,
  PortalShell,
  StatusBadge,
} from "@/components/portal/PortalPrimitives";
import { privateSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  head: () => privateSeoHead("Member Dashboard — Lefa Connect"),
  loader: async () => {
    try {
      const [dashboard, communication] = await Promise.all([
        getMemberDashboard(),
        getMemberCommunication(),
      ]);
      return { ...dashboard, communication };
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: MemberDashboard,
});

function money(cents: number | null | undefined) {
  if (cents == null) return "Not available";
  const amount = Math.round(cents / 100).toString();
  return `R${amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

const southAfricaDateFormatter = new Intl.DateTimeFormat("en-ZA", {
  timeZone: "Africa/Johannesburg",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const southAfricaDateTimeFormatter = new Intl.DateTimeFormat("en-ZA", {
  timeZone: "Africa/Johannesburg",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function southAfricaDate(value: Date | string, includeTime: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  const formatter = includeTime ? southAfricaDateTimeFormatter : southAfricaDateFormatter;
  return formatter.format(date);
}

function date(value: Date | null | undefined) {
  return value ? southAfricaDate(value, false) : "Not available";
}

function dateTime(value: Date | null | undefined) {
  return value ? southAfricaDate(value, true) : "Not available";
}

function DataPoint({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-navy">{value}</dd>
    </div>
  );
}

type DashboardPeriod = {
  id: string;
  dueDate: string;
  amountDueCents: number;
  amountPaidCents: number;
  balanceCents: number;
  overpaymentCents: number;
  status: string;
};

function paymentStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function StatusText({ status }: { status: string }) {
  return <StatusBadge status={status.replaceAll("_", " ")} />;
}

function MemberCommunication({
  communication,
}: {
  communication: Awaited<ReturnType<typeof getMemberCommunication>>;
}) {
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);

  useEffect(() => {
    const notificationIds = communication.notifications
      .filter((item: any) => !item.readAt)
      .map((item: any) => item.id);
    const announcementIds = communication.announcements
      .filter((item: any) => !item.readAt)
      .map((item: any) => item.id);
    if (notificationIds.length || announcementIds.length || communication.conversation?.id) {
      void markCommunicationRead({
        data: { notificationIds, announcementIds, conversationId: communication.conversation?.id },
      });
    }
  }, [communication]);

  const submitText = async () => {
    if (!message.trim()) return;
    setBusy(true);
    await sendMemberMessage({ data: { content: message, kind: "TEXT" } });
    window.location.reload();
  };

  const toggleRecording = async () => {
    if (recording && recorder.current) {
      recorder.current.stop();
      setRecording(false);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    chunks.current = [];
    startedAt.current = Date.now();
    mediaRecorder.ondataavailable = (event) => chunks.current.push(event.data);
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType || "audio/webm" });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      setBusy(true);
      await sendMemberMessage({
        data: {
          kind: "VOICE",
          audioDataBase64: btoa(binary),
          mimeType: blob.type,
          durationSeconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
        },
      });
      window.location.reload();
    };
    recorder.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
  };

  const playVoice = async (messageId: string, mimeType: string) => {
    let source = audioUrls[messageId];
    if (!source) {
      const audio = await getVoiceMessage({ data: { messageId } });
      source = `data:${audio.mimeType || mimeType};base64,${audio.dataBase64}`;
      setAudioUrls((current) => ({ ...current, [messageId]: source as string }));
    }
    await new Audio(source).play();
  };

  return (
    <>
      <PortalSection icon={Bell} label="Latest from Lefa Connect" title="Announcements">
        <div id="announcements" />
        {communication.announcements.length ? (
          communication.announcements.map((announcement: any) => (
            <article key={announcement.id} className="border-b border-border py-4 last:border-b-0">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-navy">{announcement.title}</h3>
                {!announcement.readAt ? <StatusText status="NEW" /> : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {announcement.content}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {announcement.publishedAt ? dateTime(announcement.publishedAt) : ""}
              </p>
            </article>
          ))
        ) : (
          <PortalEmptyState icon={Bell}>
            No announcements yet. Important updates from Lefa Connect will appear here.
          </PortalEmptyState>
        )}
      </PortalSection>
      <PortalSection
        icon={MessageCircle}
        label="Messages"
        title="Your conversations"
        action={
          communication.unreadCount ? (
            <StatusText status={`Messages ${communication.unreadCount}`} />
          ) : undefined
        }
      >
        <div id="messages" />
        {communication.conversation?.messages.length ? (
          <div className="space-y-3">
            {communication.conversation.messages.map((item: any) => (
              <div key={item.id} className="border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-heritage">
                    {item.kind === "VOICE" ? "Voice note" : "Message"}
                  </p>
                  <span className="text-xs text-muted-foreground">{dateTime(item.createdAt)}</span>
                </div>
                {item.kind === "VOICE" ? (
                  <button
                    type="button"
                    onClick={() => void playVoice(item.id, item.mimeType || "audio/webm")}
                    className="mt-3 border border-border px-4 py-2 text-sm font-semibold text-navy"
                  >
                    Voice message · {item.durationSeconds ?? 0}s ▶
                  </button>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-navy">{item.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <PortalEmptyState icon={MessageCircle}>
            No messages yet. Your conversations with Lefa Connect will appear here.
          </PortalEmptyState>
        )}
        {communication.conversation ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a reply"
              className="min-h-12 flex-1 border border-input bg-background px-3 text-sm"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void submitText()}
              className="bg-navy px-4 py-3 text-xs font-semibold uppercase text-on-navy"
            >
              Send
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggleRecording()}
              className="border border-heritage px-4 py-3 text-xs font-semibold uppercase text-heritage"
            >
              {recording ? "Stop recording" : "Voice note"}
            </button>
          </div>
        ) : null}
      </PortalSection>
    </>
  );
}

function MemberDashboard() {
  const dashboard = Route.useLoaderData();
  const { application, membership, payment, profile, selection, user } = dashboard;
  const communication = dashboard.communication;
  const contributionPeriods = dashboard.contributionPeriods as DashboardPeriod[];
  const currentContribution = contributionPeriods[0];
  const totalContributionPaid = contributionPeriods.reduce(
    (total, period) => total + period.amountPaidCents,
    0,
  );
  const totalContributionBalance = contributionPeriods.reduce(
    (total, period) => total + period.balanceCents,
    0,
  );
  const totalContributionOverpayment = contributionPeriods.reduce(
    (total, period) => total + period.overpaymentCents,
    0,
  );

  return (
    <PortalShell
      eyebrow="Member home"
      title={`Welcome, ${user.name}`}
      description="Your membership, contribution record and Lefa Connect updates in one place."
      userName={user.email}
      navItems={[
        { label: "Home", href: "#home", icon: Home },
        { label: "My membership", href: "#membership", icon: Landmark },
        { label: "Contributions", href: "#contributions", icon: CircleDollarSign },
        { label: "Payments", href: "#payments", icon: ClipboardList },
        { label: "Documents", href: "#documents", icon: FileText },
        { label: "Messages", href: "#messages", icon: MessageCircle },
        { label: "Announcements", href: "#announcements", icon: Bell },
        { label: "Livestock & projects", href: "#projects", icon: Sprout },
        { label: "Profile", href: "#profile", icon: UserRound },
      ]}
    >
      <div id="home" className="space-y-8">
        <section className="relative overflow-hidden bg-navy px-6 py-8 text-on-navy md:px-10 md:py-10">
          <div
            className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-[var(--gold)]/20"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-36 right-20 h-72 w-72 rounded-full border border-heritage/30"
            aria-hidden="true"
          />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-[var(--gold)]">Your membership is active</p>
              <h2 className="mt-3 max-w-2xl text-4xl leading-tight text-on-navy md:text-5xl">
                A connected place to grow with Lefa.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-on-navy-muted">
                Your official membership record, financial activity and future agricultural journey
                stay connected here.
              </p>
            </div>
            <div className="shrink-0 border border-white/15 bg-white/10 p-5">
              <p className="eyebrow text-[var(--gold)]">Member number</p>
              <p className="mt-3 font-display text-2xl text-on-navy">
                {membership.membershipNumber}
              </p>
              <div className="mt-3">
                <StatusText status="ACTIVE" />
              </div>
            </div>
          </div>
        </section>

        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Membership summary"
        >
          <PortalMetric
            icon={Landmark}
            label="Your membership"
            value={`${selection?.shareCount ?? 0} shares`}
            detail={`${selection?.slotCount ?? 0} active slots`}
            dark
          />
          <PortalMetric
            icon={CircleDollarSign}
            label="Monthly contribution"
            value={money(selection?.monthlyContributionCents)}
            detail="Standard scheduled amount"
          />
          <PortalMetric
            icon={ClipboardList}
            label="Membership status"
            value="Active"
            detail={`Member since ${date(membership.activatedAt)}`}
          />
          <PortalMetric
            icon={Sprout}
            label="Contribution balance"
            value={money(totalContributionBalance)}
            detail={totalContributionBalance > 0 ? "Needs attention" : "No balance due"}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <PortalSection
              icon={Landmark}
              label="My membership"
              title="Your membership details"
              action={<StatusText status={membership.status} />}
            >
              <div id="membership" />
              <dl className="grid gap-5 sm:grid-cols-2">
                <DataPoint
                  label="Category"
                  value={application.membershipCategory ?? "Not recorded"}
                />
                <DataPoint label="Member number" value={membership.membershipNumber} />
                <DataPoint label="Activation date" value={date(membership.activatedAt)} />
                <DataPoint label="Shareholding" value={`${selection?.shareCount ?? 0} shares`} />
                <DataPoint label="Joining fee" value="Paid" />
                <DataPoint label="Application reference" value={application.reference} />
              </dl>
              <h3 className="mt-8 text-sm font-semibold tracking-[0.12em] text-navy uppercase">
                Membership slots
              </h3>
              {membership.slots.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {membership.slots.map((slot: any) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between border border-border bg-[#fbfaf7] p-4"
                    >
                      <div>
                        <p className="text-xs text-muted-foreground">Slot {slot.slotNumber}</p>
                        <p className="mt-1 text-sm font-semibold text-navy">Shareholding slot</p>
                      </div>
                      <StatusText status={slot.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <PortalEmptyState>No membership slots are currently recorded.</PortalEmptyState>
              )}
            </PortalSection>

            <PortalSection
              icon={CircleDollarSign}
              label="Contributions"
              title="Keep your membership moving"
              action={
                dashboard.contributionSchedule ? (
                  <StatusText status={dashboard.contributionSchedule.status} />
                ) : undefined
              }
            >
              <div id="contributions" />
              {dashboard.contributionSchedule ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="bg-heritage p-5 text-on-navy">
                      <p className="eyebrow text-[var(--gold)]">Monthly contribution</p>
                      <p className="mt-4 font-display text-3xl">
                        {money(dashboard.contributionSchedule.monthlyAmountCents)}
                      </p>
                      <p className="mt-2 text-xs text-on-navy-muted">Scheduled amount</p>
                    </div>
                    <div className="border border-border bg-[#fbfaf7] p-5">
                      <p className="eyebrow text-heritage">Next contribution</p>
                      <p className="mt-4 font-display text-2xl text-navy">
                        {currentContribution?.dueDate ?? "No contribution period currently open"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {currentContribution
                          ? money(currentContribution.balanceCents) + " remaining"
                          : "Your next contribution date will appear here once your contribution cycle begins."}
                      </p>
                    </div>
                    <div className="border border-border bg-[#fbfaf7] p-5">
                      <p className="eyebrow text-heritage">Monthly contributions paid</p>
                      <p className="mt-4 font-display text-2xl text-navy">
                        {money(totalContributionPaid)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {contributionPeriods.length
                          ? "Across recorded periods"
                          : "No monthly contribution periods recorded yet."}
                      </p>
                    </div>
                  </div>
                  {totalContributionOverpayment > 0 ? (
                    <p className="mt-5 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                      Overpayment awaiting administrative handling:{" "}
                      {money(totalContributionOverpayment)}.
                    </p>
                  ) : null}
                  <h3 className="mt-8 text-sm font-semibold tracking-[0.12em] text-navy uppercase">
                    Contribution history
                  </h3>
                  {contributionPeriods.length ? (
                    <div className="mt-4 divide-y divide-border border-y border-border">
                      {contributionPeriods.map((period) => (
                        <div
                          key={period.id}
                          className="flex flex-wrap items-center justify-between gap-4 py-4"
                        >
                          <div>
                            <p className="font-semibold text-navy">Due {period.dueDate}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Paid {money(period.amountPaidCents)} · Balance{" "}
                              {money(period.balanceCents)}
                            </p>
                          </div>
                          <StatusText status={paymentStatusLabel(period.status)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <PortalEmptyState>
                      No contribution periods have been generated yet.
                    </PortalEmptyState>
                  )}
                </>
              ) : (
                <PortalEmptyState>
                  No recurring contribution schedule is available yet.
                </PortalEmptyState>
              )}
            </PortalSection>

            <PortalSection
              icon={ClipboardList}
              label="Payments"
              title="Payment records"
              action={payment ? <StatusText status={payment.status} /> : undefined}
            >
              <div id="payments" />
              <dl className="grid gap-5 sm:grid-cols-2">
                <DataPoint
                  label="Joining payment"
                  value={
                    payment?.status === "VERIFIED"
                      ? "Payment Verified"
                      : (payment?.status ?? "Not available")
                  }
                />
                <DataPoint
                  label="Joining fee"
                  value={payment?.status === "VERIFIED" ? "Paid" : money(payment?.amountDueCents)}
                />
                <DataPoint
                  label="Payment reference"
                  value={payment?.paymentReference ?? "Not available"}
                />
                <DataPoint label="Total recorded paid" value={money(dashboard.totalPaidCents)} />
              </dl>
              <div className="mt-7">
                <h3 className="text-sm font-semibold text-navy">Payment history</h3>
                {dashboard.paymentHistory.length ? (
                  <div className="mt-3 divide-y divide-border border-y border-border">
                    {dashboard.paymentHistory.map((record: any) => (
                      <div
                        key={record.id}
                        className="flex flex-wrap items-center justify-between gap-4 py-4"
                      >
                        <div>
                          <p className="font-semibold text-navy">{money(record.amountPaidCents)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {record.paymentReference} · {record.paymentDate}
                          </p>
                        </div>
                        <StatusText status={paymentStatusLabel(record.status)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">
                    <PortalEmptyState>No payment history is recorded.</PortalEmptyState>
                  </div>
                )}
              </div>
              <div className="mt-6">
                {dashboard.outstandingBalanceCents > 0 ? (
                  <p className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    Outstanding joining payment balance: {money(dashboard.outstandingBalanceCents)}.
                  </p>
                ) : (
                  <PortalEmptyState>
                    No outstanding joining payment balance is recorded.
                  </PortalEmptyState>
                )}
              </div>
            </PortalSection>
          </div>

          <div className="space-y-8">
            <PortalSection
              icon={ClipboardList}
              label="Application"
              title="Your membership is active"
            >
              <div className="flex items-start gap-3">
                <StatusText status="ACTIVE" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Your application is complete and your membership is now part of the Lefa Connect
                  community.
                </p>
              </div>
              <Link
                to="/applicant"
                className="mt-5 inline-flex border border-input px-4 py-3 text-xs font-semibold tracking-[0.1em] text-navy uppercase transition hover:border-heritage"
              >
                View application record
              </Link>
            </PortalSection>
            <MemberCommunication communication={communication} />
            <PortalSection icon={FileText} label="Documents" title="Your records">
              <div id="documents" />
              <div className="space-y-3">
                <PortalEmptyState icon={FileText}>
                  Your membership agreement, certificates and other important records will appear
                  here as they become available.
                </PortalEmptyState>
                <PortalEmptyState icon={FileText}>
                  Shareholding agreements, certificates and payment proofs will appear here once
                  available.
                </PortalEmptyState>
              </div>
            </PortalSection>
            <PortalSection icon={Sprout} label="Livestock & projects" title="Connected activity">
              <div id="projects" />
              {application.livestockCount || application.livestockTypes?.length ? (
                <dl className="grid gap-5 sm:grid-cols-2">
                  <DataPoint
                    label="Livestock count"
                    value={application.livestockCount ?? "Not recorded"}
                  />
                  <DataPoint
                    label="Livestock types"
                    value={application.livestockTypes?.join(", ") ?? "Not recorded"}
                  />
                </dl>
              ) : (
                <PortalEmptyState icon={Sprout}>
                  Your livestock and project activity will appear here as your Lefa Connect journey
                  grows.
                </PortalEmptyState>
              )}
            </PortalSection>
            <PortalSection
              icon={UserRound}
              label="Profile"
              title="Your information"
              action={
                <Link
                  to="/applicant"
                  className="text-xs font-semibold tracking-[0.1em] text-digital uppercase hover:underline"
                >
                  Edit profile
                </Link>
              }
            >
              <div id="profile" />
              <dl className="space-y-4">
                <DataPoint
                  label="Full name"
                  value={
                    `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || user.name
                  }
                />
                <DataPoint label="Email" value={profile?.email ?? user.email} />
                <DataPoint label="Mobile number" value={profile?.mobileNumber ?? "Not recorded"} />
                <DataPoint
                  label="Residence"
                  value={profile?.residentialAddress ?? "Not recorded"}
                />
              </dl>
            </PortalSection>
          </div>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
          <span>Application reference: {application.reference}</span>
          <Link to="/" className="font-semibold text-heritage hover:underline">
            Return to Lefa Connect home
          </Link>
        </footer>
      </div>
    </PortalShell>
  );
}
