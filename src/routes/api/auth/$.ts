import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth.server";

function handle(request: Request) {
  return getAuth().handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
