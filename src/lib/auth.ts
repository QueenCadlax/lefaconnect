import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { accounts, sessions, users, verifications } from "./db/schema";
import * as schema from "./db/schema";

export type Phase1Env = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
};

export function createAuth(env: Phase1Env) {
  const database = drizzle(env.DB, { schema: { accounts, sessions, users, verifications } });

  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "sqlite",
      schema: { account: accounts, session: sessions, user: users, verification: verifications },
      transaction: false,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [
      ...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : []),
      "http://localhost:*",
      "http://127.0.0.1:*",
    ],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    user: {
      fields: {
        emailVerified: "emailVerified",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
      additionalFields: {
        status: {
          type: "string",
          defaultValue: "created",
          input: false,
        },
      },
    },
    session: {
      fields: {
        expiresAt: "expiresAt",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        ipAddress: "ipAddress",
        userAgent: "userAgent",
        userId: "userId",
      },
    },
    account: {
      fields: {
        accountId: "accountId",
        providerId: "providerId",
        issuer: "issuer",
        userId: "userId",
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        idToken: "idToken",
        accessTokenExpiresAt: "accessTokenExpiresAt",
        refreshTokenExpiresAt: "refreshTokenExpiresAt",
        scope: "scope",
        password: "password",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    },
    verification: {
      fields: {
        expiresAt: "expiresAt",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    },
    advanced: {
      useSecureCookies: env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
    },
  });
}

export type AuthDatabase = DrizzleD1Database<typeof schema>;
