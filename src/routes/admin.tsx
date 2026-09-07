import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  getAdminApplicationDetail,
  getAdminDashboardSummary,
  getAdminMemberList,
  getAdminPaymentQueue,
  getAdminReviewQueue,
  updatePaymentVerification,
  updateApplicationReview,
} from "@/lib/application.server";
import {
  adjustContributionCredit,
  getAdminContributionQueue,
  updateContributionPayment,
  updateContributionScheduleStatus,
} from "@/lib/contributions.server";
import {
  archiveAnnouncement,
  createAnnouncement,
  getAdminCommunication,
  getVoiceMessage,
  sendAdminMessage,
  updateAnnouncement,
} from "@/lib/communication.server";
import {
  ClipboardCheck,
  FileText,
  Home,
  Landmark,
  MessageCircle,
  Mic,
  Sprout,
  UsersRound,
} from "lucide-react";
import { PortalEmptyState, PortalSection, PortalShell } from "@/components/portal/PortalPrimitives";
import { privateSeoHead } from "@/lib/seo";

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pending Review",
  APPROVED_PENDING_PAYMENT: "Approved - Payment Pending",
  PAYMENT_PENDING_VERIFICATION: "Payment Pending Verification",
  ACTIVE: "Active",
  REJECTED: "Rejected",
  CHANGES_REQUESTED: "Changes Requested",
};

export const Route = createFileRoute("/admin")({
  head: () => privateSeoHead("Admin Command Centre — Lefa Connect"),
  loader: async () => {
    try {
      return await getAdminReviewQueue();
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminReviewPage,
});

function formatMoney(value?: number | null) {
  if (value == null) return "—";
  return `R${(value / 100).toLocaleString()}`;
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getAdminGreeting(date: Date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning, Admin 👋";
  if (hour >= 12 && hour < 17) return "Good afternoon, Admin 👋";
  return "Good evening, Admin 👋";
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function AdminCommunicationCentre() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminCommunication>> | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<"ALL_MEMBERS" | "ACTIVE_MEMBERS" | "SELECTED_MEMBERS">(
    "ACTIVE_MEMBERS",
  );
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);

  const refresh = async () => setData(await getAdminCommunication());
  useEffect(() => {
    void refresh();
  }, []);

  const publish = async () => {
    setBusy(true);
    await createAnnouncement({
      data: { title, content, audience, memberUserIds: selectedMemberId ? [selectedMemberId] : [] },
    });
    setTitle("");
    setContent("");
    setAudience("ACTIVE_MEMBERS");
    await refresh();
    setBusy(false);
  };

  const edit = async () => {
    if (!editingId) return;
    setBusy(true);
    await updateAnnouncement({ data: { announcementId: editingId, title, content } });
    setEditingId(null);
    setTitle("");
    setContent("");
    await refresh();
    setBusy(false);
  };

  const sendText = async () => {
    if (!selectedMemberId || !message.trim()) return;
    setBusy(true);
    await sendAdminMessage({
      data: { memberUserId: selectedMemberId, content: message, kind: "TEXT" },
    });
    setMessage("");
    await refresh();
    setBusy(false);
  };

  const toggleVoice = async () => {
    if (recording && recorder.current) {
      recorder.current.stop();
      setRecording(false);
      return;
    }
    if (!selectedMemberId) return;
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
      await sendAdminMessage({
        data: {
          memberUserId: selectedMemberId,
          kind: "VOICE",
          audioDataBase64: btoa(binary),
          mimeType: blob.type,
          durationSeconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
        },
      });
      await refresh();
      setBusy(false);
    };
    recorder.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);
  };

  const playVoice = async (messageId: string) => {
    const audio = await getVoiceMessage({ data: { messageId } });
    await new Audio(`data:${audio.mimeType};base64,${audio.dataBase64}`).play();
  };

  if (!data)
    return (
      <section id="communication" className="surface-card mt-10 bg-card p-5 md:p-8">
        Loading Communication Centre…
      </section>
    );
  const selectedConversation = data.conversations.find(
    (conversation: any) => conversation.memberUserId === selectedMemberId,
  );
  return (
    <section
      id="communication"
      className="surface-card mt-10 min-w-0 bg-card p-5 md:p-8 lg:col-span-3"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-heritage">Communication Centre</p>
          <h2 className="mt-2 font-display text-3xl text-navy">
            Announcements, messages and voice notes
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Publish governed updates and continue secure member conversations across text and voice.
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {data.announcements.filter((item: any) => item.status === "PUBLISHED").length} published ·{" "}
          {data.conversations.length} conversations
        </span>
      </div>
      <div className="mt-8 grid min-w-0 gap-8 xl:grid-cols-2">
        <div className="min-w-0 border border-border p-5">
          <h3 className="font-display text-2xl text-navy">Announcements</h3>
          <div className="mt-4 space-y-3">
            {data.announcements.map((announcement: any) => (
              <article key={announcement.id} className="border border-border p-4">
                <div className="flex justify-between gap-3">
                  <p className="font-semibold text-navy">{announcement.title}</p>
                  <span className="text-xs uppercase text-muted-foreground">
                    {announcement.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{announcement.content}</p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(announcement.id);
                      setTitle(announcement.title);
                      setContent(announcement.content);
                    }}
                    className="text-xs font-semibold uppercase text-heritage"
                  >
                    Edit
                  </button>
                  {announcement.status === "PUBLISHED" ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await archiveAnnouncement({ data: { announcementId: announcement.id } });
                        await refresh();
                      }}
                      className="text-xs font-semibold uppercase text-muted-foreground"
                    >
                      Archive
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Announcement title"
              className="min-h-12 w-full border border-input bg-background px-3 text-sm"
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Announcement message"
              rows={4}
              className="w-full border border-input bg-background px-3 py-3 text-sm"
            />
            <select
              value={audience}
              onChange={(event) => setAudience(event.target.value as typeof audience)}
              className="min-h-12 w-full border border-input bg-background px-3 text-sm"
            >
              <option value="ALL_MEMBERS">All members</option>
              <option value="ACTIVE_MEMBERS">Active members</option>
              <option value="SELECTED_MEMBERS">Selected member</option>
            </select>
            {audience === "SELECTED_MEMBERS" ? (
              <select
                value={selectedMemberId}
                onChange={(event) => setSelectedMemberId(event.target.value)}
                className="min-h-12 w-full border border-input bg-background px-3 text-sm"
              >
                <option value="">Choose member</option>
                {data.members.map((member: { id: string; name: string; email: string }) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {member.email}
                  </option>
                ))}
              </select>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => void (editingId ? edit() : publish())}
              className="bg-navy px-5 py-3 text-xs font-semibold uppercase text-on-navy"
            >
              {editingId ? "Save announcement" : "Publish announcement"}
            </button>
          </div>
        </div>
        <div className="min-w-0 border border-border p-5">
          <h3 className="font-display text-2xl text-navy">Private conversations</h3>
          <select
            value={selectedMemberId}
            onChange={(event) => setSelectedMemberId(event.target.value)}
            className="mt-4 min-h-12 w-full border border-input bg-background px-3 text-sm"
          >
            <option value="">Choose a member</option>
            {data.members.map((member: any) => (
              <option key={member.id} value={member.id}>
                {member.name} · {member.membershipNumber}
              </option>
            ))}
          </select>
          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
            {selectedConversation?.messages.map((item: any) => (
              <div key={item.id} className="border border-border bg-background p-3">
                <p className="text-xs font-semibold uppercase text-heritage">
                  {item.kind === "VOICE" ? "Voice note" : "Message"}
                </p>
                {item.kind === "VOICE" ? (
                  <button
                    type="button"
                    onClick={() => void playVoice(item.id)}
                    className="mt-2 border border-border px-3 py-2 text-sm text-navy"
                  >
                    Voice message · {item.durationSeconds ?? 0}s ▶
                  </button>
                ) : (
                  <p className="mt-1 text-sm text-navy">{item.content}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            )) ?? <PortalEmptyState>Select a member to open a conversation.</PortalEmptyState>}
          </div>
          {selectedMemberId ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write a message"
                className="min-h-12 flex-1 border border-input bg-background px-3 text-sm"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => void sendText()}
                className="bg-navy px-4 py-3 text-xs font-semibold uppercase text-on-navy"
              >
                Send
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggleVoice()}
                className="border border-heritage px-4 py-3 text-xs font-semibold uppercase text-heritage"
              >
                <Mic className="mr-2 inline h-4 w-4" />
                {recording ? "Stop" : "Voice note"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AdminReviewPage() {
  const initial = Route.useLoaderData();
  const [greeting, setGreeting] = useState<string | null>(null);
  const [queue, setQueue] = useState(initial.applications ?? []);
  const [dashboard, setDashboard] = useState<Awaited<
    ReturnType<typeof getAdminDashboardSummary>
  > | null>(null);
  const [selectedId, setSelectedId] = useState<string>(initial.applications?.[0]?.id ?? "");
  const [detail, setDetail] = useState<Awaited<
    ReturnType<typeof getAdminApplicationDetail>
  > | null>(null);
  const [decision, setDecision] = useState<
    "APPROVED_PENDING_PAYMENT" | "REJECTED" | "CHANGES_REQUESTED"
  >("APPROVED_PENDING_PAYMENT");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentQueue, setPaymentQueue] = useState<
    Awaited<ReturnType<typeof getAdminPaymentQueue>>
  >({ payments: [] });
  const [paymentNotes, setPaymentNotes] = useState<Record<string, string>>({});
  const [contributionQueue, setContributionQueue] = useState<
    Awaited<ReturnType<typeof getAdminContributionQueue>>
  >({ schedules: [], periods: [], payments: [] });
  const [contributionNotes, setContributionNotes] = useState<Record<string, string>>({});
  const [contributionPreview, setContributionPreview] = useState<
    Record<string, { fileName: string; mimeType: string; sizeBytes: number; dataBase64: string }>
  >({});
  const [scheduleReasons, setScheduleReasons] = useState<Record<string, string>>({});
  const [creditInputs, setCreditInputs] = useState<
    Record<string, { amount: string; reason: string }>
  >({});
  const [memberList, setMemberList] = useState<
    Awaited<ReturnType<typeof import("@/lib/application.server").getAdminMemberList>>["members"]
  >([]);

  const refreshQueue = async () => {
    const data = await getAdminReviewQueue();
    setQueue(data.applications ?? []);
    if (
      selectedId &&
      !data.applications?.some((application: any) => application.id === selectedId)
    ) {
      setSelectedId(data.applications?.[0]?.id ?? "");
    }
  };

  const refreshPayments = async () => setPaymentQueue(await getAdminPaymentQueue());

  const refreshAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, paymentData, contributionData] = await Promise.all([
        getAdminDashboardSummary(),
        getAdminPaymentQueue(),
        getAdminContributionQueue(),
      ]);
      setDashboard(dashboardData);
      setPaymentQueue(paymentData);
      setContributionQueue(contributionData);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Could not load the admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshPayments();
    void refreshAdminData();
    void getAdminMemberList().then((result: any) => setMemberList(result.members));
  }, []);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getAdminGreeting(new Date()));
    updateGreeting();
    const interval = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const handlePaymentDecision = async (paymentId: string, decision: "VERIFIED" | "REJECTED") => {
    setSaving(true);
    try {
      await updatePaymentVerification({
        data: { paymentId, decision, notes: paymentNotes[paymentId] ?? "" },
      } as never);
      await refreshPayments();
      setMessage(`Payment ${decision === "VERIFIED" ? "verified" : "rejected"}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update the payment.");
    } finally {
      setSaving(false);
    }
  };

  const handleContributionDecision = async (
    paymentId: string,
    decision: "VERIFIED" | "REJECTED",
  ) => {
    setSaving(true);
    try {
      await updateContributionPayment({
        data: { paymentId, decision, notes: contributionNotes[paymentId] ?? "" },
      } as never);
      setContributionQueue(await getAdminContributionQueue());
      setMessage(`Contribution payment ${decision === "VERIFIED" ? "verified" : "rejected"}.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update the contribution payment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleContributionPreview = async (paymentId: string) => {
    try {
      const preview = await import("@/lib/contributions.server").then((module) =>
        module.getContributionPaymentPreview({ data: { paymentId } } as never),
      );
      setContributionPreview((current) => ({
        ...current,
        [paymentId]: {
          fileName: preview.fileName,
          mimeType: preview.mimeType,
          sizeBytes: preview.sizeBytes,
          dataBase64: preview.dataBase64,
        },
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load the proof of payment.");
    }
  };

  const handleScheduleStatus = async (scheduleId: string, status: "ACTIVE" | "PAUSED") => {
    setSaving(true);
    try {
      await updateContributionScheduleStatus({
        data: { scheduleId, status, reason: scheduleReasons[scheduleId] ?? "" },
      } as never);
      setContributionQueue(await getAdminContributionQueue());
      setMessage(`Contribution schedule ${status === "PAUSED" ? "paused" : "resumed"}.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update the contribution schedule.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreditAdjustment = async (membershipId: string) => {
    const input = creditInputs[membershipId] ?? { amount: "", reason: "" };
    setSaving(true);
    try {
      await adjustContributionCredit({
        data: { membershipId, amountCents: Number(input.amount), reason: input.reason },
      } as never);
      setCreditInputs((current) => ({ ...current, [membershipId]: { amount: "", reason: "" } }));
      setContributionQueue(await getAdminContributionQueue());
      setMessage("Credit adjustment recorded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not adjust member credit.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!selectedId && queue[0]) {
      setSelectedId(queue[0].id);
      return;
    }

    if (!selectedId) {
      setDetail(null);
      return;
    }

    void (async () => {
      const record = await getAdminApplicationDetail({
        data: { applicationId: selectedId },
      } as never);
      setDetail(record);
      if (record.status === "PENDING_REVIEW") {
        setDecision("APPROVED_PENDING_PAYMENT");
      }
    })();
  }, [selectedId, queue]);

  const handleDecision = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const result = await updateApplicationReview({
        data: {
          applicationId: selectedId,
          decision,
          notes,
        },
      } as never);
      setMessage(
        `Application ${result.reference} marked as ${STATUS_LABELS[result.status] ?? result.status}.`,
      );
      await refreshQueue();
      const refreshed = await getAdminApplicationDetail({
        data: { applicationId: selectedId },
      } as never);
      setDetail(refreshed);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update the application.");
    } finally {
      setSaving(false);
    }
  };

  const selectedApplication =
    queue.find((application: any) => application.id === selectedId) ?? null;

  return (
    <PortalShell
      eyebrow="Admin command centre"
      title="Lefa Connect operations"
      description="Review applications, verify payments and keep member activity moving."
      navItems={[
        { label: "Dashboard", href: "#home", icon: Home },
        { label: "Applications", href: "#applications", icon: ClipboardCheck },
        { label: "Members", href: "#members", icon: UsersRound },
        { label: "Payments", href: "#payments", icon: Landmark },
        { label: "Contributions", href: "#contributions", icon: ClipboardCheck },
        { label: "Communication", href: "#communication", icon: MessageCircle },
        { label: "Documents", href: "#documents", icon: FileText },
        { label: "Livestock & projects", href: "#projects", icon: Sprout },
      ]}
    >
      <div className="mx-auto max-w-7xl">
        <div
          id="home"
          className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-7 md:flex-row md:items-end"
        >
          <div>
            <p className="eyebrow text-heritage">{greeting}</p>
            <h1 className="mt-3 font-display text-4xl text-navy md:text-5xl">
              Admin command centre
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Here’s what’s happening across Lefa Connect today.
          </p>
        </div>
        <div id="applications" />
        <h2 className="sr-only">Membership applications</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Review submitted applications and approve, reject or request changes.
        </p>

        {message ? (
          <div className="mt-6 border border-border bg-card p-4 text-sm text-navy">{message}</div>
        ) : null}
        {error ? (
          <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading && !dashboard ? (
          <div className="mt-8 border border-border bg-card p-8 text-sm text-muted-foreground">
            Loading admin dashboard…
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="border border-border bg-card p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Total applications
            </p>
            <p className="mt-3 font-display text-3xl text-navy">
              {dashboard?.stats.totalApplications ?? 0}
            </p>
          </article>
          <article className="border border-border bg-card p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Pending review
            </p>
            <p className="mt-3 font-display text-3xl text-navy">
              {dashboard?.stats.pendingReview ?? 0}
            </p>
          </article>
          <article className="border border-border bg-card p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Joining payments
            </p>
            <p className="mt-3 font-display text-3xl text-navy">
              {dashboard?.stats.paymentPendingVerification ?? 0}
            </p>
          </article>
          <article className="border border-border bg-card p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Active members
            </p>
            <p className="mt-3 font-display text-3xl text-navy">
              {dashboard?.stats.activeMembers ?? 0}
            </p>
          </article>
          <article className="border border-border bg-card p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Contribution payments
            </p>
            <p className="mt-3 font-display text-3xl text-navy">
              {dashboard?.stats.pendingContributionPayments ?? 0}
            </p>
          </article>
        </div>

        <section className="surface-card mt-8 bg-card p-5 md:p-8">
          <h2 className="font-display text-3xl text-navy">Recent activity</h2>
          <div className="mt-6 space-y-3">
            {dashboard?.recentAuditLogs.length ? (
              dashboard.recentAuditLogs.map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background p-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-navy">{entry.action}</p>
                    <p className="text-muted-foreground">
                      {entry.entityType} · {entry.entityId}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent audit activity available yet.
              </p>
            )}
          </div>
        </section>

        <section className="surface-card mt-8 bg-card p-5 md:p-8">
          <h2 className="font-display text-3xl text-navy">Roles & access</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Admin",
                description:
                  "Full access to applications, verification, contributions and governance",
              },
              {
                label: "Member",
                description:
                  "Application tracking, profile updates, membership and payment dashboard",
              },
              {
                label: "Reviewer",
                description: "Application review and approvals with supporting evidence access",
              },
              {
                label: "Finance",
                description: "Contribution review, payment verification and schedule controls",
              },
            ].map((role) => (
              <div key={role.label} className="border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-heritage">
                  {role.label}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="border border-border bg-card p-4">
            <h2 className="text-sm font-semibold tracking-[0.12em] text-navy uppercase">
              Review queue
            </h2>
            <div className="mt-4 space-y-3">
              {queue.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications currently awaiting review.
                </p>
              ) : (
                queue.map((application: any) => (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() => setSelectedId(application.id)}
                    className={`w-full border p-4 text-left transition ${selectedId === application.id ? "border-heritage bg-heritage/5" : "border-border bg-transparent"}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-navy">{application.reference}</span>
                      <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                        {STATUS_LABELS[application.status] ?? application.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {application.applicant?.name ?? "Applicant"}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Submitted{" "}
                      {application.submittedAt
                        ? new Date(application.submittedAt).toLocaleString()
                        : "—"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="border border-border bg-card p-5 md:p-8">
            {!selectedApplication || !detail ? (
              <p className="text-sm text-muted-foreground">Select an application to review.</p>
            ) : (
              <div className="space-y-8">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-3xl text-navy">{detail.reference}</h2>
                    <span className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-heritage">
                      {STATUS_LABELS[detail.status] ?? detail.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Applicant:{" "}
                    <strong className="text-navy">{detail.applicant?.name ?? "—"}</strong> ·{" "}
                    {detail.applicant?.email ?? "—"}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border border-border p-4">
                    <h3 className="text-sm font-semibold tracking-[0.14em] text-navy uppercase">
                      Applicant profile
                    </h3>
                    <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <div>
                        <dt className="text-[0.68rem] uppercase tracking-[0.12em]">Name</dt>
                        <dd className="font-semibold text-navy">
                          {detail.profile?.firstName ?? "—"} {detail.profile?.lastName ?? ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.68rem] uppercase tracking-[0.12em]">
                          ID / Passport
                        </dt>
                        <dd className="font-semibold text-navy">
                          {detail.profile?.idOrPassportNumber ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.68rem] uppercase tracking-[0.12em]">DOB</dt>
                        <dd className="font-semibold text-navy">
                          {detail.profile?.dateOfBirth ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.68rem] uppercase tracking-[0.12em]">Mobile</dt>
                        <dd className="font-semibold text-navy">
                          {detail.profile?.mobileNumber ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.68rem] uppercase tracking-[0.12em]">Email</dt>
                        <dd className="font-semibold text-navy">{detail.profile?.email ?? "—"}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="border border-border p-4">
                    <h3 className="text-sm font-semibold tracking-[0.14em] text-navy uppercase">
                      Residence & contact
                    </h3>
                    <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <div>
                        <dt className="text-[0.68rem] uppercase tracking-[0.12em]">Address</dt>
                        <dd className="font-semibold text-navy">
                          {detail.profile?.residentialAddress ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.68rem] uppercase tracking-[0.12em]">Country</dt>
                        <dd className="font-semibold text-navy">
                          {detail.profile?.country ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.68rem] uppercase tracking-[0.12em]">
                          Province / State
                        </dt>
                        <dd className="font-semibold text-navy">
                          {detail.profile?.regionOrProvinceState ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.68rem] uppercase tracking-[0.12em]">
                          District / City
                        </dt>
                        <dd className="font-semibold text-navy">
                          {detail.profile?.districtOrCity ?? "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="border border-border p-4">
                  <h3 className="text-sm font-semibold tracking-[0.14em] text-navy uppercase">
                    Membership & financial selection
                  </h3>
                  <dl className="mt-4 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="text-[0.68rem] uppercase tracking-[0.12em]">Category</dt>
                      <dd className="font-semibold text-navy">
                        {detail.membershipCategory ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.68rem] uppercase tracking-[0.12em]">
                        Selected memberships
                      </dt>
                      <dd className="font-semibold text-navy">
                        {detail.selection?.slotCount ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.68rem] uppercase tracking-[0.12em]">Shares</dt>
                      <dd className="font-semibold text-navy">
                        {detail.selection?.shareCount ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.68rem] uppercase tracking-[0.12em]">
                        Monthly contribution
                      </dt>
                      <dd className="font-semibold text-navy">
                        {formatMoney(detail.selection?.monthlyContributionCents)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.68rem] uppercase tracking-[0.12em]">Joining fee</dt>
                      <dd className="font-semibold text-navy">
                        {formatMoney(detail.selection?.joiningFeeCents)}
                      </dd>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <dt className="text-[0.68rem] uppercase tracking-[0.12em]">
                        Reason for joining
                      </dt>
                      <dd className="font-semibold text-navy">{detail.reasonForJoining ?? "—"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="border border-border p-4">
                  <h3 className="text-sm font-semibold tracking-[0.14em] text-navy uppercase">
                    Next of kin
                  </h3>
                  <div className="mt-4 space-y-4">
                    {detail.kin?.length ? (
                      detail.kin.map((person: any) => (
                        <div
                          key={person.id}
                          className="rounded border border-border p-3 text-sm text-muted-foreground"
                        >
                          <p className="font-semibold text-navy">{person.fullName}</p>
                          <p className="mt-1">Relationship: {person.relationship}</p>
                          <p className="mt-1">Mobile: {person.mobileNumber}</p>
                          {person.address ? (
                            <p className="mt-1">Address: {person.address}</p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No next-of-kin details captured.
                      </p>
                    )}
                  </div>
                </div>

                {detail.status === "PENDING_REVIEW" ? (
                  <div className="border border-border p-4">
                    <h3 className="text-sm font-semibold tracking-[0.14em] text-navy uppercase">
                      Decision
                    </h3>
                    <div className="mt-4 space-y-3">
                      <label className="flex items-center gap-3 text-sm text-navy">
                        <input
                          type="radio"
                          name="decision"
                          checked={decision === "APPROVED_PENDING_PAYMENT"}
                          onChange={() => setDecision("APPROVED_PENDING_PAYMENT")}
                        />
                        Approve — payment pending
                      </label>
                      <label className="flex items-center gap-3 text-sm text-navy">
                        <input
                          type="radio"
                          name="decision"
                          checked={decision === "CHANGES_REQUESTED"}
                          onChange={() => setDecision("CHANGES_REQUESTED")}
                        />
                        Request changes
                      </label>
                      <label className="flex items-center gap-3 text-sm text-navy">
                        <input
                          type="radio"
                          name="decision"
                          checked={decision === "REJECTED"}
                          onChange={() => setDecision("REJECTED")}
                        />
                        Reject
                      </label>
                    </div>

                    <label className="mt-5 block text-sm text-navy">
                      <span className="mb-2 block font-semibold">Review notes</span>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={4}
                        className="w-full border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Add internal notes or feedback to the applicant."
                      />
                    </label>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleDecision()}
                      className="mt-5 bg-navy px-5 py-3 text-sm font-semibold text-on-navy uppercase disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Submit decision"}
                    </button>
                  </div>
                ) : (
                  <div className="border border-border p-4 text-sm text-muted-foreground">
                    This application is no longer pending review and has already been marked as{" "}
                    {STATUS_LABELS[detail.status] ?? detail.status}.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <section id="members" className="surface-card mt-10 bg-card p-5 md:p-8">
          <h2 className="font-display text-3xl text-navy">Member management</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Active members, membership status, contributions and payment history.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {memberList.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                No active members are currently available.
              </div>
            ) : (
              memberList.map((member: any) => (
                <article key={member.id} className="border border-border bg-background p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-heritage">
                        {member.membershipNumber}
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-navy">{member.memberName}</h3>
                    </div>
                    <span className="rounded-full border border-border px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {member.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{member.memberEmail}</p>
                  <dl className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between gap-3">
                      <dt>Category</dt>
                      <dd className="font-semibold text-navy">{member.membershipCategory}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Slots</dt>
                      <dd className="font-semibold text-navy">{member.slotCount}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Shares</dt>
                      <dd className="font-semibold text-navy">{member.shareCount}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Schedule</dt>
                      <dd className="font-semibold text-navy">{member.scheduleStatus}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Payment status</dt>
                      <dd className="font-semibold text-navy">{member.paymentStatus}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Contribution paid</dt>
                      <dd className="font-semibold text-navy">
                        {formatMoney(member.totalContributionPaidCents)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Contribution balance</dt>
                      <dd className="font-semibold text-navy">
                        {formatMoney(member.totalContributionBalanceCents)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))
            )}
          </div>
        </section>

        <section id="payments" className="surface-card mt-10 bg-card p-5 md:p-8">
          <h2 className="font-display text-3xl text-navy">Payment Verification</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Review submitted joining payments and proof of payment.
          </p>
          <div className="mt-6 space-y-5">
            {paymentQueue.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No payments are awaiting verification.
              </p>
            ) : (
              paymentQueue.payments.map((payment: any) => (
                <article key={payment.id} className="border border-border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl text-navy">
                        {payment.applicationReference}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{payment.applicantName}</p>
                    </div>
                    <span className="text-xs font-semibold tracking-[0.12em] text-heritage uppercase">
                      {payment.status}
                    </span>
                  </div>
                  <dl className="mt-5 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt>Amount due</dt>
                      <dd className="font-semibold text-navy">
                        {formatMoney(payment.amountDueCents)}
                      </dd>
                    </div>
                    <div>
                      <dt>Amount paid</dt>
                      <dd className="font-semibold text-navy">
                        {formatMoney(payment.amountPaidCents)}
                      </dd>
                    </div>
                    <div>
                      <dt>Payment reference</dt>
                      <dd className="font-semibold text-navy">{payment.paymentReference}</dd>
                    </div>
                    <div>
                      <dt>Payment date</dt>
                      <dd className="font-semibold text-navy">{payment.paymentDate}</dd>
                    </div>
                    <div>
                      <dt>POP filename</dt>
                      <dd className="font-semibold text-navy">{payment.popFileName}</dd>
                    </div>
                    <div>
                      <dt>POP type</dt>
                      <dd className="font-semibold text-navy">{payment.popMimeType}</dd>
                    </div>
                    <div>
                      <dt>POP size</dt>
                      <dd className="font-semibold text-navy">
                        {formatBytes(payment.popSizeBytes)}
                      </dd>
                    </div>
                    <div>
                      <dt>Submitted</dt>
                      <dd className="font-semibold text-navy">
                        {new Date(payment.submittedAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                  <details className="mt-5 border-t border-border pt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-navy">
                      View proof of payment
                    </summary>
                    <a
                      className="mt-3 inline-block text-sm text-digital underline"
                      href={`data:${payment.popMimeType};base64,${payment.popDataBase64}`}
                      download={payment.popFileName}
                    >
                      Open {payment.popFileName}
                    </a>
                  </details>
                  <label className="mt-5 block text-sm text-navy">
                    <span className="mb-2 block font-semibold">Review notes</span>
                    <textarea
                      value={paymentNotes[payment.id] ?? ""}
                      onChange={(event) =>
                        setPaymentNotes((current) => ({
                          ...current,
                          [payment.id]: event.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full border border-input bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handlePaymentDecision(payment.id, "VERIFIED")}
                      className="bg-heritage px-4 py-3 text-sm font-semibold text-on-navy uppercase disabled:opacity-60"
                    >
                      Verify Payment
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handlePaymentDecision(payment.id, "REJECTED")}
                      className="border border-input px-4 py-3 text-sm font-semibold text-navy uppercase disabled:opacity-60"
                    >
                      Reject Payment
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section id="contributions" className="surface-card mt-10 bg-card p-5 md:p-8">
          <h2 className="font-display text-3xl text-navy">Recurring contributions</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Schedules, outstanding periods, and submitted contribution payments.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Active schedules</p>
              <p className="mt-2 font-display text-2xl text-navy">
                {contributionQueue.schedules.length}
              </p>
            </div>
            <div className="border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Overdue periods</p>
              <p className="mt-2 font-display text-2xl text-navy">
                {contributionQueue.periods.length}
              </p>
            </div>
            <div className="border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Pending payments</p>
              <p className="mt-2 font-display text-2xl text-navy">
                {contributionQueue.payments.length}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {contributionQueue.schedules.map((schedule: any) => {
              const creditInput = creditInputs[schedule.membershipId] ?? { amount: "", reason: "" };
              return (
                <article key={schedule.id} className="border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-navy">Schedule controls</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {schedule.id} · {schedule.status}
                  </p>
                  <input
                    value={scheduleReasons[schedule.id] ?? ""}
                    onChange={(event) =>
                      setScheduleReasons((current) => ({
                        ...current,
                        [schedule.id]: event.target.value,
                      }))
                    }
                    placeholder="Mandatory pause/resume reason"
                    className="mt-3 w-full border border-input bg-card px-3 py-2 text-sm"
                  />
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={saving || schedule.status === "PAUSED"}
                      onClick={() => void handleScheduleStatus(schedule.id, "PAUSED")}
                      className="border border-input px-4 py-2 text-xs font-semibold text-navy uppercase disabled:opacity-60"
                    >
                      Pause schedule
                    </button>
                    <button
                      type="button"
                      disabled={saving || schedule.status === "ACTIVE"}
                      onClick={() => void handleScheduleStatus(schedule.id, "ACTIVE")}
                      className="bg-heritage px-4 py-2 text-xs font-semibold text-on-navy uppercase disabled:opacity-60"
                    >
                      Resume schedule
                    </button>
                  </div>
                  <p className="mt-5 text-sm font-semibold text-navy">Manual credit adjustment</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[10rem_1fr]">
                    <input
                      value={creditInput.amount}
                      onChange={(event) =>
                        setCreditInputs((current) => ({
                          ...current,
                          [schedule.membershipId]: { ...creditInput, amount: event.target.value },
                        }))
                      }
                      placeholder="Cents (+/-)"
                      inputMode="numeric"
                      className="border border-input bg-card px-3 py-2 text-sm"
                    />
                    <input
                      value={creditInput.reason}
                      onChange={(event) =>
                        setCreditInputs((current) => ({
                          ...current,
                          [schedule.membershipId]: { ...creditInput, reason: event.target.value },
                        }))
                      }
                      placeholder="Mandatory adjustment reason"
                      className="border border-input bg-card px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleCreditAdjustment(schedule.membershipId)}
                    className="mt-3 bg-navy px-4 py-2 text-xs font-semibold text-on-navy uppercase disabled:opacity-60"
                  >
                    Record credit adjustment
                  </button>
                </article>
              );
            })}
            {contributionQueue.payments.length ? (
              contributionQueue.payments.map((payment: any) => (
                <article key={payment.id} className="border border-border p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <strong className="text-navy">{payment.paymentReference}</strong>
                    <span className="text-xs font-semibold tracking-[0.1em] text-heritage uppercase">
                      {payment.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {payment.memberName} · {formatMoney(payment.amountSubmittedCents)} ·{" "}
                    {payment.paymentDate} · {payment.popFileName}
                  </p>
                  {payment.periodYear && payment.periodMonth ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Period: {payment.periodYear}-{String(payment.periodMonth).padStart(2, "0")} ·
                      Due: {payment.dueDate ?? "—"}
                    </p>
                  ) : null}
                  {contributionPreview[payment.id]
                    ? (() => {
                        const preview = contributionPreview[payment.id];
                        if (!preview) return null;
                        return (
                          <div className="mt-4 border border-border bg-background p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-navy">
                              POP preview
                            </p>
                            <a
                              className="mt-2 inline-block text-sm text-digital underline"
                              href={`data:${preview.mimeType};base64,${preview.dataBase64}`}
                              download={preview.fileName}
                            >
                              Open {preview.fileName}
                            </a>
                          </div>
                        );
                      })()
                    : null}
                  <textarea
                    value={contributionNotes[payment.id] ?? ""}
                    onChange={(event) =>
                      setContributionNotes((current) => ({
                        ...current,
                        [payment.id]: event.target.value,
                      }))
                    }
                    rows={2}
                    className="mt-4 w-full border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Review notes"
                  />
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleContributionPreview(payment.id)}
                      className="border border-input px-4 py-2 text-xs font-semibold text-navy uppercase disabled:opacity-60"
                    >
                      View POP
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleContributionDecision(payment.id, "VERIFIED")}
                      className="bg-heritage px-4 py-2 text-xs font-semibold text-on-navy uppercase disabled:opacity-60"
                    >
                      Verify contribution
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleContributionDecision(payment.id, "REJECTED")}
                      className="border border-input px-4 py-2 text-xs font-semibold text-navy uppercase disabled:opacity-60"
                    >
                      Reject contribution
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState>No recurring contribution payments await verification.</EmptyState>
            )}
          </div>
          {contributionQueue.periods.length ? (
            <p className="mt-5 text-sm text-amber-800">
              There are {contributionQueue.periods.length} overdue contribution periods requiring
              attention.
            </p>
          ) : null}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <AdminCommunicationCentre />
          <div id="documents">
            <PortalSection icon={FileText} label="Documents" title="Document management">
              <PortalEmptyState icon={FileText}>
                Member agreements, certificates and payment proofs will appear here when document
                records are available.
              </PortalEmptyState>
            </PortalSection>
          </div>
          <div id="projects">
            <PortalSection
              icon={Sprout}
              label="Livestock & projects"
              title="Agricultural operations"
            >
              <PortalEmptyState icon={Sprout}>
                Livestock and project records are not available in the current operational data set.
              </PortalEmptyState>
            </PortalSection>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
