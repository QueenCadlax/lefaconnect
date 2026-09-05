import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";

export type RuntimeEnv = {
  DB?: D1Database;
  R2?: R2Bucket;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
};

const runtimeEnvKey = Symbol.for("lefa-connect.runtime-env");

export function setRuntimeEnv(env: unknown) {
  Object.defineProperty(globalThis, runtimeEnvKey, {
    configurable: true,
    value: env as RuntimeEnv,
  });
}

export function getRuntimeEnv(): RuntimeEnv {
  const cloudflareEnv = (
    globalThis as typeof globalThis & {
      __env__?: RuntimeEnv;
    }
  ).__env__;

  return {
    ...(process.env as unknown as RuntimeEnv),
    ...(cloudflareEnv ?? {}),
    ...((globalThis as typeof globalThis & { [runtimeEnvKey]?: RuntimeEnv })[runtimeEnvKey] ?? {}),
  };
}

export function getDatabase() {
  const env = getRuntimeEnv();
  if (!env.DB) throw new Error("D1 DB binding is not configured.");
  return drizzle(env.DB, { schema });
}

export function getR2Bucket() {
  const env = getRuntimeEnv();
  if (!env.R2) throw new Error("R2 bucket binding is not configured.");
  return env.R2;
}
