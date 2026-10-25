import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import type { TerminalValues } from "../../../../packages/domain/src/terminals";
import { deleteTerminal, listTerminals, prepareTerminalFolder, saveTerminal } from "./terminals";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const initial: TerminalValues = { Codigo: "T", Descricao: "Terminal", codbarras_inicio: 1, codbarras_fim: 255, quant_inicio: 0, quant_fim: 2, pasta_localizacao: "C:\\Synthetic  ", nome_ficheiro: "d'Água.txt" };
beforeAll(async () => { server = await startIsolatedPostgres(); database = await server.database(); await migrate(database); const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => server.connect(name); }, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
it("SRC-f62ee211d1 actual writes require code then description and preserve every field and selected identity", async () => {
  expect(await saveTerminal(connect, { mode: "create", values: { ...initial, Codigo: "", Descricao: "" } })).toEqual({ kind: "required", message: "Indique um código" });
  expect(await saveTerminal(connect, { mode: "create", values: { ...initial, Descricao: "" } })).toEqual({ kind: "required", message: "Indique uma descrição" });
  expect((await database.query('SELECT count(*)::text AS n FROM app."Terminais"')).rows[0].n).toBe("0");
  const saved = await saveTerminal(connect, { mode: "create", values: initial });
  if (saved.kind !== "saved") throw new Error("Setup failed");
  expect(saved.terminal).toMatchObject(initial);
  expect(await saveTerminal(connect, { mode: "update", id: saved.terminal.id, values: { ...initial, Codigo: "X" } })).toEqual({ kind: "codeLocked" });
  const edited = await saveTerminal(connect, { mode: "update", id: saved.terminal.id, values: { ...initial, nome_ficheiro: null, quant_inicio: null } });
  expect(edited).toEqual({ kind: "saved", terminal: { ...saved.terminal, nome_ficheiro: null, quant_inicio: null } });
});
it("ADR-016 serializes duplicates without inventing an automatic source ID or relationship guard", async () => {
  const race = await Promise.all([1, 2].map(() => saveTerminal(connect, { mode: "create", values: { ...initial, Codigo: "R" } })));
  expect(race.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  const imported = await database.query<{ id: string }>('INSERT INTO app."Terminais" ("Codigo","Descricao") VALUES ($1,NULL),($1,$2) RETURNING _row_id::text AS id', ["DUP", "Original  "]);
  expect(await saveTerminal(connect, { mode: "update", id: imported.rows[0].id, values: { ...initial, Codigo: "DUP" } })).toMatchObject({ kind: "saved", terminal: { id: imported.rows[0].id } });
  expect(await deleteTerminal(connect, { id: imported.rows[0].id })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "Descricao" FROM app."Terminais" WHERE "Codigo"=$1', ["DUP"])).rows).toEqual([{ Descricao: "Original  " }]);
});
it("SRC-1589c564c4 explicit folder seek repositions the save buffer and after-seek writes the positioned record", async () => {
  const saved = await saveTerminal(connect, { mode: "create", values: { ...initial, Codigo: "F1" } });
  if (saved.kind !== "saved") throw new Error("Setup failed");
  const positioned = await prepareTerminalFolder(connect, { code: "F" });
  expect(positioned).toEqual({ kind: "positioned", terminal: saved.terminal });
  const changed = { ...initial, Codigo: "F", Descricao: "After chooser", pasta_localizacao: "" };
  expect(await saveTerminal(connect, { mode: "after-folder-seek", id: saved.terminal.id, values: changed })).toEqual({ kind: "saved", terminal: { ...changed, id: saved.terminal.id } });
  expect((await database.query('SELECT count(*)::text AS n FROM app."Terminais" WHERE "Codigo"=$1', ["F1"])).rows[0].n).toBe("0");
  expect(await saveTerminal(connect, { mode: "after-folder-seek", id: saved.terminal.id, values: { ...changed, Codigo: "R" } })).toMatchObject({ kind: "duplicate" });
});
it("ADR-016 actual failed transaction rolls back and invalid DTOs cannot write", async () => {
  await database.query(`CREATE FUNCTION public.reject_terminal() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_terminal BEFORE INSERT ON app."Terminais" FOR EACH ROW EXECUTE FUNCTION public.reject_terminal()');
  try { expect(await saveTerminal(connect, { mode: "create", values: { ...initial, Codigo: "ERR" } })).toEqual({ kind: "failed" }); }
  finally { await database.query('DROP TRIGGER reject_terminal ON app."Terminais"'); }
  expect((await database.query('SELECT count(*)::text AS n FROM app."Terminais" WHERE "Codigo"=$1', ["ERR"])).rows[0].n).toBe("0");
  expect(await saveTerminal(connect, { mode: "create", values: { ...initial, Codigo: "BAD", quant_fim: 256 } })).toEqual({ kind: "invalid" });
  expect(await listTerminals(connect, { sort: 'Codigo";DROP TABLE Terminais;--' })).toEqual({ kind: "invalid" });
});
it("ADR-004 actual terminal routes deny anonymous calls and persist authenticated writes", async () => {
  const denied = createApp({ terminalConnect: connect });
  for (const action of ["list", "save", "delete", "prepare-folder"]) expect((await denied.inject({ method: "POST", url: `/api/terminals/${action}`, payload: {} })).statusCode).toBe(401);
  await denied.close(); const app = createApp({ terminalConnect: connect, authenticate: async () => ({ userId: "synthetic-test" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/terminals/save", payload: { mode: "create", values: { ...initial, Codigo: "API" } } })).json();
    expect(saved.kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/terminals/list", payload: {} })).json().terminals.some((row: { Codigo: string }) => row.Codigo === "API")).toBe(true);
    expect((await app.inject({ method: "POST", url: "/api/terminals/delete", payload: { id: saved.terminal.id } })).json()).toEqual({ kind: "deleted" });
  } finally { await app.close(); }
});
it("GS-TERMINALS-001 real API edit and duplicate matches complete spec-derived export", async () => {
  const app = createApp({ terminalConnect: connect, authenticate: async () => ({ userId: "synthetic-golden" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/terminals/save", payload: { mode: "create", values: { ...initial, Codigo: "GLD" } } })).json();
    expect(saved.kind).toBe("saved");
    const values = { ...initial, Codigo: "GLD", Descricao: "Final", pasta_localizacao: "", nome_ficheiro: "data.txt" };
    expect((await app.inject({ method: "POST", url: "/api/terminals/save", payload: { mode: "update", id: saved.terminal.id, values } })).json().kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/terminals/save", payload: { mode: "create", values } })).json().kind).toBe("duplicate");
    const exported = await database.query('SELECT "Codigo","Descricao","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim","pasta_localizacao","nome_ficheiro" FROM app."Terminais" WHERE _row_id=$1', [saved.terminal.id]);
    const target = resolve(server.directory, "terminal-golden"); await mkdir(target);
    const columns = Object.keys(values), csv = (value: unknown) => '"' + String(value).replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "Terminais.csv"), columns.join(",") + "\n" + exported.rows.map(row => columns.map(key => csv(row[key])).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-TERMINALS-001/compare.json", "--legacy", "docs/golden/GS-TERMINALS-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});
