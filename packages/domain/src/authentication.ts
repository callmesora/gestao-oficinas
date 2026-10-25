import { z } from "zod";
import { accessSchema } from "./startup";
import type { UserListRow, UserList } from "./users";

// ADR004: the source selection/Upper/15-character contract applies to new credentials too.
export const authenticationLoginSchema = accessSchema;
export const authenticationEnrollmentSchema = z.strictObject({ code: z.number().int().min(1).max(255), password: z.string().min(1).max(15), token: z.string().regex(/^[a-f0-9]{64}(?![\s\S])/) });
export type AuthenticationEnrollment = z.infer<typeof authenticationEnrollmentSchema>;
export type AuthenticationUserListResult = { kind: "loaded"; users: Pick<UserListRow, "Codigo" | "Descricao">[] } | { kind: "invalid" | "failed" };
export type AuthenticationSession = { token: string; expiresAt: string; user: UserListRow };
export type AuthenticationStatus = { kind: "ready"; setupRequired: boolean; setupAvailable: boolean; emptyUsers: boolean } | { kind: "failed" };
export type AuthenticationResult = { kind: "continuar"; session: AuthenticationSession; user: UserListRow }
  | { kind: "incorrect"; message: "Utilizador e/ou palavra-passe incorreto(s)" }
  | { kind: "missing" | "invalid" | "failed" | "resetRequired" | "unavailable" | "throttled" };
export type AuthenticationCheck = { kind: "authenticated"; user: UserListRow; expiresAt: string } | { kind: "unauthenticated" };
export interface AuthenticationRepository {
  status(): Promise<AuthenticationStatus>;
  users(input: UserList): Promise<AuthenticationUserListResult>;
  login(input: z.infer<typeof authenticationLoginSchema>): Promise<AuthenticationResult>;
  enroll(input: AuthenticationEnrollment): Promise<AuthenticationResult>;
  logout(): Promise<void>;
}
