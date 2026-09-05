import { createServerFn as createTanStackServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { getAuth } from "./auth.server";
import { getDatabase } from "./runtime.server";
import { storage } from "./storage.server";
import {
  announcementRecipients,
  announcements,
  conversations,
  membershipApplications,
  memberships,
  messages,
  notifications,
  users,
} from "./db/schema";

const createServerFn: any = createTanStackServerFn;

type Database = ReturnType<typeof getDatabase>;
type CommunicationAudience = "ALL_MEMBERS" | "ACTIVE_MEMBERS" | "SELECTED_MEMBERS";
type MessageKind = "TEXT" | "VOICE";

async function requireUser() {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  if (!session?.user) throw new Error("Authentication required.");
  return session.user;
}

async function requireAdmin() {
  const user = await requireUser();
  const database = getDatabase();
  const currentUser = await database.query.users.findFirst({ where: eq(users.id, user.id) });
  if (currentUser?.status !== "admin") throw new Error("Administrator access required.");
  return currentUser;
}

async function activeMemberIds(database: Database) {
  const rows = await database
    .select({ userId: memberships.userId })
    .from(memberships)
    .where(eq(memberships.status, "ACTIVE"));
  return [...new Set(rows.map((row) => row.userId))];
}

async function notify(
  database: Database,
  userId: string,
  type: string,
  entityType: string,
  entityId: string,
  title: string,
  body: string,
) {
  const now = new Date();
  await database.insert(notifications).values({
    id: crypto.randomUUID(),
    userId,
    type,
    entityType,
    entityId,
    title,
    body,
    readAt: null,
    createdAt: now,
    updatedAt: now,
  });
}

async function ensureConversation(database: Database, memberUserId: string, adminUserId: string) {
  const existing = await database.query.conversations.findFirst({
    where: eq(conversations.memberUserId, memberUserId),
  });
  if (existing) return existing;
  const now = new Date();
  const conversation = {
    id: crypto.randomUUID(),
    memberUserId,
    adminUserId,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  };
  await database.insert(conversations).values(conversation);
  return conversation;
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

export const getMemberCommunication = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const database = getDatabase();
  const [announcementRows, conversation, notificationRows] = await Promise.all([
    database
      .select({ announcement: announcements, recipient: announcementRecipients })
      .from(announcementRecipients)
      .innerJoin(announcements, eq(announcements.id, announcementRecipients.announcementId))
      .where(and(eq(announcementRecipients.userId, user.id), eq(announcements.status, "PUBLISHED")))
      .orderBy(desc(announcements.publishedAt)),
    database.query.conversations.findFirst({ where: eq(conversations.memberUserId, user.id) }),
    database.query.notifications.findMany({
      where: eq(notifications.userId, user.id),
      orderBy: (fields, operators) => operators.desc(fields.createdAt),
      limit: 30,
    }),
  ]);
  const messageRows = conversation
    ? await database.query.messages.findMany({
        where: eq(messages.conversationId, conversation.id),
        orderBy: (fields, operators) => operators.asc(fields.createdAt),
      })
    : [];
  return {
    announcements: announcementRows.map(({ announcement, recipient }) => ({
      ...announcement,
      readAt: recipient.readAt,
    })),
    conversation: conversation
      ? {
          id: conversation.id,
          messages: messageRows,
        }
      : null,
    notifications: notificationRows,
    unreadCount:
      notificationRows.filter((notification) => !notification.readAt).length +
      messageRows.filter((message) => message.recipientUserId === user.id && !message.readAt)
        .length,
  };
});

export const markCommunicationRead = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: { notificationIds?: string[]; announcementIds?: string[]; conversationId?: string };
  }) => {
    const user = await requireUser();
    const database = getDatabase();
    const now = new Date();
    if (data.notificationIds?.length) {
      await database
        .update(notifications)
        .set({ readAt: now, updatedAt: now })
        .where(
          and(eq(notifications.userId, user.id), inArray(notifications.id, data.notificationIds)),
        );
    }
    if (data.announcementIds?.length) {
      await database
        .update(announcementRecipients)
        .set({ readAt: now, updatedAt: now })
        .where(
          and(
            eq(announcementRecipients.userId, user.id),
            inArray(announcementRecipients.announcementId, data.announcementIds),
          ),
        );
    }
    if (data.conversationId) {
      await database
        .update(messages)
        .set({ readAt: now, updatedAt: now })
        .where(
          and(
            eq(messages.conversationId, data.conversationId),
            eq(messages.recipientUserId, user.id),
            isNull(messages.readAt),
          ),
        );
    }
    return { ok: true };
  },
);

export const sendMemberMessage = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      content?: string;
      kind?: MessageKind;
      audioDataBase64?: string;
      mimeType?: string;
      durationSeconds?: number;
    };
  }) => {
    const user = await requireUser();
    const database = getDatabase();
    const conversation = await database.query.conversations.findFirst({
      where: eq(conversations.memberUserId, user.id),
    });
    if (!conversation) throw new Error("No communication conversation has been opened yet.");
    return sendMessage(database, conversation, user.id, conversation.adminUserId, data);
  },
);

async function sendMessage(
  database: Database,
  conversation: typeof conversations.$inferSelect,
  senderUserId: string,
  recipientUserId: string,
  data: {
    content?: string;
    kind?: MessageKind;
    audioDataBase64?: string;
    mimeType?: string;
    durationSeconds?: number;
  },
) {
  const kind = data.kind ?? "TEXT";
  if (kind === "TEXT" && !data.content?.trim()) throw new Error("Message content is required.");
  if (kind === "VOICE" && !data.audioDataBase64) throw new Error("Voice recording is required.");
  const id = crypto.randomUUID();
  let storageKey: string | null = null;
  if (kind === "VOICE" && data.audioDataBase64) {
    storageKey = `communication/${conversation.id}/${id}.webm`;
    await storage.upload({
      key: storageKey,
      data: decodeBase64(data.audioDataBase64),
      mimeType: data.mimeType || "audio/webm",
      metadata: { conversationId: conversation.id, messageId: id },
    });
  }
  const now = new Date();
  await database.insert(messages).values({
    id,
    conversationId: conversation.id,
    senderUserId,
    recipientUserId,
    kind,
    content: data.content?.trim() || null,
    storageKey,
    mimeType: data.mimeType || null,
    durationSeconds: data.durationSeconds ?? null,
    readAt: null,
    createdAt: now,
    updatedAt: now,
  });
  await database
    .update(conversations)
    .set({ updatedAt: now })
    .where(eq(conversations.id, conversation.id));
  await notify(
    database,
    recipientUserId,
    kind === "VOICE" ? "VOICE_MESSAGE" : "MESSAGE",
    "conversation",
    conversation.id,
    kind === "VOICE" ? "New voice note" : "New message",
    kind === "VOICE"
      ? "You received a voice note from Lefa Connect."
      : data.content?.trim() || "You received a new message.",
  );
  return { id, conversationId: conversation.id };
}

export const getVoiceMessage = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { messageId: string } }) => {
    const user = await requireUser();
    const database = getDatabase();
    const message = await database.query.messages.findFirst({
      where: eq(messages.id, data.messageId),
    });
    if (!message?.storageKey) throw new Error("Voice message not found.");
    const conversation = await database.query.conversations.findFirst({
      where: eq(conversations.id, message.conversationId),
    });
    if (
      !conversation ||
      (conversation.memberUserId !== user.id && user.id !== conversation.adminUserId)
    )
      throw new Error("You do not have access to this voice message.");
    const file = await storage.retrieve({ key: message.storageKey });
    let binary = "";
    for (const byte of new Uint8Array(file.data)) binary += String.fromCharCode(byte);
    return { mimeType: file.mime, dataBase64: btoa(binary) };
  },
);

export const getAdminCommunication = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const database = getDatabase();
  const [memberRows, announcementRows, conversationRows] = await Promise.all([
    database
      .select({ user: users, membership: memberships, application: membershipApplications })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .innerJoin(membershipApplications, eq(membershipApplications.id, memberships.applicationId))
      .where(eq(memberships.status, "ACTIVE")),
    database.query.announcements.findMany({
      orderBy: (fields, operators) => operators.desc(fields.createdAt),
    }),
    database.query.conversations.findMany({
      orderBy: (fields, operators) => operators.desc(fields.updatedAt),
    }),
  ]);
  const conversationsWithMessages = await Promise.all(
    conversationRows.map(async (conversation) => ({
      ...conversation,
      member: memberRows.find((row) => row.user.id === conversation.memberUserId)?.user ?? null,
      messages: await database.query.messages.findMany({
        where: eq(messages.conversationId, conversation.id),
        orderBy: (fields, operators) => operators.asc(fields.createdAt),
      }),
    })),
  );
  return {
    members: memberRows.map(({ user, membership }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      membershipNumber: membership.membershipNumber,
    })),
    announcements: announcementRows,
    conversations: conversationsWithMessages,
  };
});

export const createAnnouncement = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      title: string;
      content: string;
      audience: CommunicationAudience;
      memberUserIds?: string[];
    };
  }) => {
    const admin = await requireAdmin();
    if (!data.title.trim() || !data.content.trim())
      throw new Error("Title and message are required.");
    const database = getDatabase();
    const now = new Date();
    const announcement = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      content: data.content.trim(),
      audience: data.audience,
      status: "PUBLISHED",
      publishedAt: now,
      archivedAt: null,
      createdByUserId: admin.id,
      createdAt: now,
      updatedAt: now,
    };
    await database.insert(announcements).values(announcement);
    const recipients =
      data.audience === "SELECTED_MEMBERS"
        ? (data.memberUserIds ?? [])
        : await activeMemberIds(database);
    if (recipients.length) {
      await database.insert(announcementRecipients).values(
        recipients.map((userId) => ({
          id: crypto.randomUUID(),
          announcementId: announcement.id,
          userId,
          readAt: null,
          createdAt: now,
          updatedAt: now,
        })),
      );
      for (const userId of recipients)
        await notify(
          database,
          userId,
          "ANNOUNCEMENT",
          "announcement",
          announcement.id,
          announcement.title,
          announcement.content,
        );
    }
    return announcement;
  },
);

export const archiveAnnouncement = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { announcementId: string } }) => {
    await requireAdmin();
    const database = getDatabase();
    const now = new Date();
    await database
      .update(announcements)
      .set({ status: "ARCHIVED", archivedAt: now, updatedAt: now })
      .where(eq(announcements.id, data.announcementId));
    return { ok: true };
  },
);

export const updateAnnouncement = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { announcementId: string; title: string; content: string } }) => {
    await requireAdmin();
    if (!data.title.trim() || !data.content.trim())
      throw new Error("Title and message are required.");
    const database = getDatabase();
    await database
      .update(announcements)
      .set({ title: data.title.trim(), content: data.content.trim(), updatedAt: new Date() })
      .where(eq(announcements.id, data.announcementId));
    return { ok: true };
  },
);

export const sendAdminMessage = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      memberUserId: string;
      content?: string;
      kind?: MessageKind;
      audioDataBase64?: string;
      mimeType?: string;
      durationSeconds?: number;
    };
  }) => {
    const admin = await requireAdmin();
    const database = getDatabase();
    const member = await database.query.users.findFirst({ where: eq(users.id, data.memberUserId) });
    if (!member) throw new Error("Member not found.");
    const conversation = await ensureConversation(database, member.id, admin.id);
    return sendMessage(database, conversation, admin.id, member.id, data);
  },
);
