import type { AuthenticationRepository, AuthenticationResult } from "../../packages/domain/src/authentication";
import type { UserRepository } from "../application/users";
import type { StartupRepository } from "../application/startup";
import { authenticationPost, isolatedWorkflowPost, setBusinessSession } from "./workflow-http";

export function businessAuthenticationRepository(): AuthenticationRepository {
  const accept = async (result: Promise<AuthenticationResult>) => { const reply = await result; if (reply.kind === "continuar") setBusinessSession(reply.session.token); return reply; };
  return {
    status: () => authenticationPost("status", {}), users: input => authenticationPost("users", input),
    login: input => accept(authenticationPost("login", input)), enroll: input => accept(authenticationPost("enroll", input)),
    logout: async () => { const reply = await authenticationPost<{ kind: "loggedOut" | "failed" }>("logout", {}); if (reply.kind !== "loggedOut") throw new Error("Workshop logout unavailable"); },
  };
}
/** Pre-login source picker receives only public code/name; transient row keys stay client-local. */
export function accessUserRepository(authentication: AuthenticationRepository): UserRepository {
  return { list: async input => {
    const result = await authentication.users(input); if (result.kind !== "loaded") return result;
    const occurrences = new Map<string, number>();
    return { kind: "loaded", users: result.users.map(row => { const key = JSON.stringify([row.Codigo, row.Descricao]), occurrence = occurrences.get(key) ?? 0; occurrences.set(key, occurrence + 1); return { Codigo: row.Codigo, Descricao: row.Descricao, id: `${key}:${occurrence}` }; }) };
  }, read: async () => ({ kind: "invalid" }), save: async () => ({ kind: "invalid" }), remove: async () => ({ kind: "invalid" }) };
}
export async function businessStartupRepository(authentication: AuthenticationRepository, onSession: (expiresAt: string) => void): Promise<StartupRepository> {
  const post = await isolatedWorkflowPost("startup", "Startup request failed");
  return { initialise: () => post("initialise", {}), readSystem: () => post("system-read", {}), saveSystem: values => post("system-save", values), access: async command => {
    const reply = await authentication.login(command);
    if (reply.kind === "continuar") { onSession(reply.session.expiresAt); return { kind: "continuar", user: reply.user }; }
    return reply;
  } };
}
