import { randomBytes } from "node:crypto";
import type { FastifyRequest } from "fastify";

// ADR-009: opt-in synthetic identity only; not legacy access-screen authentication.
export function developmentSessions(origin: string) {
  const sessions = new Map<string, number>();
  return {
    origin,
    issue() {
      const token = randomBytes(32).toString("hex");
      const now = Date.now();
      for (const [key, expiry] of sessions) if (expiry <= now) sessions.delete(key);
      sessions.set(token, now + 8 * 60 * 60 * 1000);
      return token;
    },
    async authenticate(request: FastifyRequest) {
      const header = request.headers.authorization;
      const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
      return (sessions.get(token) ?? 0) > Date.now() ? { userId: "isolated-development" } : null;
    },
  };
}
