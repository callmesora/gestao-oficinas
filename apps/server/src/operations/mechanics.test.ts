import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import type { MechanicValues } from "../../../../packages/domain/src/mechanics";
import { deleteMechanic, listMechanics, readMechanic, saveMechanic } from "./mechanics";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
// Synthetic credentials only; this suite never imports original business records.
const initial: MechanicValues = { Codigo: 255, Descricao: "Synthetic d'Água  ", palavra_passe: "mIxEd'PaSs  ", inativo: false };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);

it("SRC-97711eb5f6 ADR-008 validates code, description and password before connecting or writing", async () => {
  let connections = 0;
  const observedConnect = async () => { connections += 1; return connect(); };
  for (const Codigo of [0, null]) expect(await saveMechanic(observedConnect, { mode: "create", values: { ...initial, Codigo, Descricao: "", palavra_passe: "" } })).toEqual({ kind: "required", message: "Falta indicar o código" });
  for (const Descricao of ["", null]) expect(await saveMechanic(observedConnect, { mode: "create", values: { ...initial, Descricao, palavra_passe: "" } })).toEqual({ kind: "required", message: "Falta preencher a descrição" });
  for (const palavra_passe of ["", null]) expect(await saveMechanic(observedConnect, { mode: "create", values: { ...initial, palavra_passe } })).toEqual({ kind: "required", message: "Falta indicar a palavra-passe" });
  for (const values of [{ ...initial, Codigo: 256 }, { ...initial, Codigo: "1" }, { ...initial, Descricao: "x".repeat(101) }, { ...initial, palavra_passe: "x".repeat(16) }, { ...initial, inativo: "false" }, { ...initial, mecanicosID: "1" }]) expect(await saveMechanic(observedConnect, { mode: "create", values })).toEqual({ kind: "invalid" });
  expect(connections).toBe(0);
  expect((await database.query('SELECT count(*)::text AS n FROM app."mecanicos"')).rows[0].n).toBe("0");
});

it("SRC-97711eb5f6 SRC-cd44f64817 preserves exact synthetic credentials and byte255 behind a narrow selected-record read", async () => {
  const saved = await saveMechanic(connect, { mode: "create", values: initial });
  if (saved.kind !== "saved") throw new Error("Mechanic setup failed");
  expect(saved.mechanic).toEqual({ id: expect.any(String), Codigo: 255, Descricao: initial.Descricao, inativo: false });
  expect(Object.keys(saved.mechanic).sort()).toEqual(["Codigo", "Descricao", "id", "inativo"]);
  expect(await readMechanic(connect, { id: saved.mechanic.id })).toEqual({ kind: "loaded", mechanic: { ...saved.mechanic, mecanicosID: "1", palavra_passe: initial.palavra_passe } });
  expect(await saveMechanic(connect, { mode: "update", id: saved.mechanic.id, values: { ...initial, Codigo: 254, palavra_passe: "Changed" } })).toEqual({ kind: "codeLocked" });
  expect((await database.query('SELECT "Codigo","palavra_passe" FROM app."mecanicos" WHERE _row_id=$1', [saved.mechanic.id])).rows).toEqual([{ Codigo: 255, palavra_passe: initial.palavra_passe }]);
  const values = { ...initial, Descricao: "  ", palavra_passe: "lowerCASE ", inativo: null };
  expect(await saveMechanic(connect, { mode: "update", id: saved.mechanic.id, values })).toEqual({ kind: "saved", mechanic: { ...saved.mechanic, Descricao: "  ", inativo: null } });
  expect(await readMechanic(connect, { id: saved.mechanic.id })).toEqual({ kind: "loaded", mechanic: { ...saved.mechanic, Descricao: "  ", inativo: null, mecanicosID: "1", palavra_passe: "lowerCASE " } });
});

it("SRC-d4e3c89519 lists NULLs without credentials and updates only the selected imported identity", async () => {
  const runId = "00000000-0000-4000-8000-000000000001";
  await database.query('INSERT INTO import_audit.runs (id,source_sha256,mapping_version) VALUES ($1,$2,1)', [runId, "a".repeat(64)]);
  const imported = await database.query<{ id: string }>('INSERT INTO app."mecanicos" (_import_id,_source_row,"mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES ($1,42,9007199254740993,2,NULL,NULL,NULL) RETURNING _row_id::text AS id', [runId]);
  const anomalies = await database.query<{ id: string; Codigo: number | null }>('INSERT INTO app."mecanicos" ("Codigo","Descricao","palavra_passe","inativo") VALUES (NULL,NULL,NULL,NULL),(0,NULL,NULL,NULL) RETURNING _row_id::text AS id,"Codigo"');
  const list = await listMechanics(connect, {});
  if (list.kind !== "loaded") throw new Error("Mechanic list failed");
  expect(list.mechanics.find(row => row.id === imported.rows[0].id)).toEqual({ id: imported.rows[0].id, Codigo: 2, Descricao: null, inativo: null });
  for (const anomaly of anomalies.rows) {
    expect(list.mechanics.find(row => row.id === anomaly.id)).toEqual({ ...anomaly, Descricao: null, inativo: null });
    expect(await readMechanic(connect, { id: anomaly.id })).toEqual({ kind: "loaded", mechanic: { ...anomaly, Descricao: null, inativo: null, mecanicosID: null, palavra_passe: null } });
  }
  for (const row of list.mechanics) expect(Object.keys(row).sort()).toEqual(["Codigo", "Descricao", "id", "inativo"]);
  expect(await readMechanic(connect, { id: imported.rows[0].id })).toEqual({ kind: "loaded", mechanic: { id: imported.rows[0].id, Codigo: 2, Descricao: null, inativo: null, mecanicosID: "9007199254740993", palavra_passe: null } });
  const values = { Codigo: 2, Descricao: "x');DROP TABLE mecanicos;--", palavra_passe: "a'Bc  ", inativo: null };
  expect(await saveMechanic(connect, { mode: "update", id: imported.rows[0].id, values })).toEqual({ kind: "saved", mechanic: { id: imported.rows[0].id, Codigo: 2, Descricao: values.Descricao, inativo: null } });
  expect((await database.query('SELECT "mecanicosID"::text,"Descricao","palavra_passe","inativo",_import_id::text,_source_row::text FROM app."mecanicos" WHERE _row_id=$1', [imported.rows[0].id])).rows).toEqual([{ mecanicosID: "9007199254740993", Descricao: values.Descricao, palavra_passe: values.palavra_passe, inativo: null, _import_id: runId, _source_row: "42" }]);
});

it("RULE-C44F7892-019 ADR-012 sorts known Boolean values and mapped numeric/text columns without an active-only filter", async () => {
  const rows = [];
  for (const values of [{ ...initial, Codigo: 10, Descricao: "Z sort", inativo: false }, { ...initial, Codigo: 11, Descricao: "A sort", inativo: true }]) {
    const result = await saveMechanic(connect, { mode: "create", values });
    if (result.kind !== "saved") throw new Error("Mechanic sorting setup failed");
    rows.push(result.mechanic);
  }
  const ids = new Set(rows.map(row => row.id));
  for (const [input, expected] of [[{}, [10, 11]], [{ sort: "inativo", descending: true }, [11, 10]], [{ sort: "Codigo", descending: true }, [11, 10]], [{ sort: "Descricao" }, [11, 10]]] as const) {
    const list = await listMechanics(connect, input);
    if (list.kind !== "loaded") throw new Error("Mechanic sorting read failed");
    expect(list.mechanics.filter(row => ids.has(row.id)).map(row => row.Codigo)).toEqual(expected);
  }
  expect(await listMechanics(connect, { sort: "palavra_passe" })).toEqual({ kind: "invalid" });
  expect(await listMechanics(connect, { sort: 'Codigo";DROP TABLE mecanicos;--' })).toEqual({ kind: "invalid" });
  expect(await readMechanic(connect, { id: "1 OR 1=1" })).toEqual({ kind: "invalid" });
});

it("SRC-97711eb5f6 ADR-008 serializes unique automatic source identities and competing numeric-code creation", async () => {
  const different = await Promise.all([20, 21].map(Codigo => saveMechanic(connect, { mode: "create", values: { ...initial, Codigo } })));
  expect(different.map(result => result.kind)).toEqual(["saved", "saved"]);
  const ids = different.map(result => { if (result.kind !== "saved") throw new Error("Mechanic allocation failed"); return result.mechanic.id; });
  const allocated = await database.query<{ mecanicosID: string }>('SELECT "mecanicosID"::text FROM app."mecanicos" WHERE _row_id=ANY($1::bigint[])', [ids]);
  expect(new Set(allocated.rows.map(row => row.mecanicosID)).size).toBe(2);
  expect(allocated.rows.every(row => BigInt(row.mecanicosID) > 9007199254740993n)).toBe(true);
  const same = await Promise.all([1, 2].map(() => saveMechanic(connect, { mode: "create", values: { ...initial, Codigo: 22 } })));
  expect(same.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  expect(same.find(result => result.kind === "duplicate")).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 22" });
  expect((await database.query('SELECT count(*)::text AS n FROM app."mecanicos" WHERE "Codigo"=22')).rows[0].n).toBe("1");
});

it("SRC-c47339c9bf deletes the selected mechanic despite related repair records and leaves those records unchanged", async () => {
  const saved = await saveMechanic(connect, { mode: "create", values: { ...initial, Codigo: 30 } });
  if (saved.kind !== "saved") throw new Error("Mechanic delete setup failed");
  const related = await database.query<{ id: string }>('INSERT INTO app."ordem_reparacao" ("reparacao_mecanico") VALUES (30) RETURNING _row_id::text AS id');
  expect(await deleteMechanic(connect, { id: saved.mechanic.id })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "reparacao_mecanico" FROM app."ordem_reparacao" WHERE _row_id=$1', [related.rows[0].id])).rows).toEqual([{ reparacao_mecanico: 30 }]);
  expect(await readMechanic(connect, { id: saved.mechanic.id })).toEqual({ kind: "missing" });
  expect(await deleteMechanic(connect, { id: saved.mechanic.id })).toEqual({ kind: "missing" });
  expect(await saveMechanic(connect, { mode: "update", id: saved.mechanic.id, values: { ...initial, Codigo: 30 } })).toEqual({ kind: "missing" });
});

it("SRC-97711eb5f6 ADR-008 actual trigger failures roll back insert/update/delete and dependent effects", async () => {
  const saved = await saveMechanic(connect, { mode: "create", values: { ...initial, Codigo: 40 } });
  if (saved.kind !== "saved") throw new Error("Mechanic rollback setup failed");
  await database.query('CREATE TABLE public.mechanic_effects (operation text)');
  await database.query(`CREATE FUNCTION public.reject_mechanic() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.mechanic_effects VALUES (TG_OP); RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_mechanic BEFORE INSERT OR UPDATE OR DELETE ON app."mecanicos" FOR EACH ROW EXECUTE FUNCTION public.reject_mechanic()');
  try {
    expect(await saveMechanic(connect, { mode: "create", values: { ...initial, Codigo: 41 } })).toEqual({ kind: "failed" });
    expect(await saveMechanic(connect, { mode: "update", id: saved.mechanic.id, values: { ...initial, Codigo: 40, palavra_passe: "Changed", inativo: true } })).toEqual({ kind: "failed" });
    expect(await deleteMechanic(connect, { id: saved.mechanic.id })).toEqual({ kind: "failed" });
  } finally { await database.query('DROP TRIGGER reject_mechanic ON app."mecanicos"'); }
  expect((await database.query('SELECT "Codigo","Descricao","palavra_passe","inativo" FROM app."mecanicos" WHERE _row_id=$1', [saved.mechanic.id])).rows).toEqual([{ ...initial, Codigo: 40 }]);
  expect((await database.query('SELECT count(*)::text AS n FROM app."mecanicos" WHERE "Codigo"=41')).rows[0].n).toBe("0");
  expect((await database.query('SELECT count(*)::text AS n FROM public.mechanic_effects')).rows[0].n).toBe("0");
});

it("ADR-008 connection refusal and actual backend termination stay typed failures for all four operations", async () => {
  const unavailable: DatabaseConnection = () => server.connect("synthetic_missing_mechanic_database");
  const terminated: DatabaseConnection = async () => {
    const client = await connect(); client.on("error", () => undefined);
    const pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid;
    await database.query("SELECT pg_terminate_backend($1)", [pid]);
    return client;
  };
  for (const connection of [unavailable, terminated]) {
    expect(await listMechanics(connection, {})).toEqual({ kind: "failed" });
    expect(await readMechanic(connection, { id: "1" })).toEqual({ kind: "failed" });
    expect(await saveMechanic(connection, { mode: "create", values: { ...initial, Codigo: 50 } })).toEqual({ kind: "failed" });
    expect(await deleteMechanic(connection, { id: "1" })).toEqual({ kind: "failed" });
  }
  expect((await database.query('SELECT count(*)::text AS n FROM app."mecanicos" WHERE "Codigo"=50')).rows[0].n).toBe("0");
});

it("ADR-004 actual routes deny anonymous access and only authenticated selected-record read exposes the synthetic credential", async () => {
  const denied = createApp({ mechanicsConnect: connect });
  for (const action of ["list", "read", "save", "delete"]) expect((await denied.inject({ method: "POST", url: `/api/mechanics/${action}`, payload: {} })).statusCode).toBe(401);
  await denied.close();
  const app = createApp({ mechanicsConnect: connect, authenticate: async () => ({ userId: "synthetic-mechanics" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/mechanics/save", payload: { mode: "create", values: { ...initial, Codigo: 60 } } })).json();
    expect(saved.kind).toBe("saved");
    expect(Object.keys(saved.mechanic).sort()).toEqual(["Codigo", "Descricao", "id", "inativo"]);
    const list = (await app.inject({ method: "POST", url: "/api/mechanics/list", payload: {} })).json();
    expect(list.mechanics.some((row: { id: string }) => row.id === saved.mechanic.id)).toBe(true);
    for (const row of list.mechanics) expect(Object.keys(row).sort()).toEqual(["Codigo", "Descricao", "id", "inativo"]);
    const read = await app.inject({ method: "POST", url: "/api/mechanics/read", payload: { id: saved.mechanic.id } });
    expect(read.headers["cache-control"]).toBe("no-store");
    expect(read.json()).toMatchObject({ kind: "loaded", mechanic: { id: saved.mechanic.id, palavra_passe: initial.palavra_passe } });
    expect((await app.inject({ method: "POST", url: "/api/mechanics/delete", payload: { id: saved.mechanic.id } })).json()).toEqual({ kind: "deleted" });
    expect((await database.query('SELECT count(*)::text AS n FROM app."mecanicos" WHERE _row_id=$1', [saved.mechanic.id])).rows[0].n).toBe("0");
  } finally { await app.close(); }
});

it("GS-MECHANICS-001 real API edit and duplicate match a spec-derived export containing no credentials", async () => {
  const app = createApp({ mechanicsConnect: connect, authenticate: async () => ({ userId: "synthetic-mechanic-golden" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/mechanics/save", payload: { mode: "create", values: { ...initial, Codigo: 77, Descricao: "Initial" } } })).json();
    expect(saved.kind).toBe("saved");
    const read = (await app.inject({ method: "POST", url: "/api/mechanics/read", payload: { id: saved.mechanic.id } })).json();
    expect(read.mechanic.palavra_passe).toBe(initial.palavra_passe);
    const values = { ...initial, Codigo: 77, Descricao: "Final d'Água  ", palavra_passe: "changedCASE  ", inativo: true };
    const edited = (await app.inject({ method: "POST", url: "/api/mechanics/save", payload: { mode: "update", id: saved.mechanic.id, values } })).json();
    expect(edited).toEqual({ kind: "saved", mechanic: { id: saved.mechanic.id, Codigo: 77, Descricao: values.Descricao, inativo: true } });
    expect((await app.inject({ method: "POST", url: "/api/mechanics/save", payload: { mode: "create", values } })).json().kind).toBe("duplicate");
    expect((await database.query('SELECT "palavra_passe" FROM app."mecanicos" WHERE _row_id=$1', [saved.mechanic.id])).rows).toEqual([{ palavra_passe: values.palavra_passe }]);
    const exported = await database.query('SELECT "Codigo","Descricao","inativo" FROM app."mecanicos" WHERE _row_id=$1', [saved.mechanic.id]);
    const target = resolve(server.directory, "mechanic-golden"); await mkdir(target);
    const columns = ["Codigo", "Descricao", "inativo"], csv = (value: unknown) => '"' + String(value).replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "mecanicos.csv"), columns.join(",") + "\n" + exported.rows.map(row => columns.map(key => csv(row[key])).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-MECHANICS-001/compare.json", "--legacy", "docs/golden/GS-MECHANICS-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});

it("SRC-d4e3c89519 ADR-008 allocates the final signed source identifier and refuses exhaustion without writes", async () => {
  const seed = await database.query<{ id: string }>('INSERT INTO app."mecanicos" ("mecanicosID","Codigo") VALUES (9223372036854775806,90) RETURNING _row_id::text AS id');
  let lastId: string | undefined;
  try {
    const last = await saveMechanic(connect, { mode: "create", values: { ...initial, Codigo: 91 } });
    if (last.kind !== "saved") throw new Error("Mechanic maximum allocation failed");
    lastId = last.mechanic.id;
    expect(await readMechanic(connect, { id: lastId })).toMatchObject({ kind: "loaded", mechanic: { mecanicosID: "9223372036854775807" } });
    expect(await saveMechanic(connect, { mode: "create", values: { ...initial, Codigo: 92 } })).toEqual({ kind: "failed" });
    expect((await database.query('SELECT count(*)::text AS n FROM app."mecanicos" WHERE "Codigo"=92')).rows[0].n).toBe("0");
  } finally { await database.query('DELETE FROM app."mecanicos" WHERE _row_id=ANY($1::bigint[])', [[seed.rows[0].id, ...(lastId ? [lastId] : [])]]); }
});
