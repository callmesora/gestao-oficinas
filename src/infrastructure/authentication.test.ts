import { expect, it } from "vitest";
import type { AuthenticationRepository } from "../../packages/domain/src/authentication";
import { accessUserRepository } from "./authentication";
it("SRC-7891e7fd29 pre-login public picker retains the selected user identity when actual source sort order changes", async () => {
  const authentication: AuthenticationRepository = { status: async () => ({ kind: "failed" }), login: async () => ({ kind: "invalid" }), enroll: async () => ({ kind: "invalid" }), logout: async () => {}, users: async input => ({ kind: "loaded", users: (input.descending ? [{ Codigo: 8, Descricao: "Second" }, { Codigo: 7, Descricao: "First" }] : [{ Codigo: 7, Descricao: "First" }, { Codigo: 8, Descricao: "Second" }]) }) };
  const picker = accessUserRepository(authentication), initial = await picker.list({}), sorted = await picker.list({ sort: "Descricao", descending: true }); expect(initial.kind).toBe("loaded"); expect(sorted.kind).toBe("loaded");
  if (initial.kind !== "loaded" || sorted.kind !== "loaded") return; const selected = initial.users[0].id; expect(sorted.users.find(row => row.id === selected)?.Codigo).toBe(7); expect(Object.keys(sorted.users[0]).sort()).toEqual(["Codigo", "Descricao", "id"]);
});
