import { createAuth } from "./auth";
import { getRuntimeEnv } from "./runtime.server";

export function getAuth() {
  const env = getRuntimeEnv();
  if (!env.DB || !env.BETTER_AUTH_SECRET) {
    throw new Error("Authentication runtime is not configured.");
  }
  return createAuth({
    DB: env.DB,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    ...(env.BETTER_AUTH_URL ? { BETTER_AUTH_URL: env.BETTER_AUTH_URL } : {}),
  });
}
