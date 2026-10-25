import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import { createSessionSecurity } from "./sessions";
import { createMechanicCredentials, saveSecureMechanic, deleteSecureMechanic } from "./mechanics";
import { verifyPassword } from "./passwords";
import { authenticateRepairLabor } from "../operations/repair-labor";
import { saveRepairMaterials } from "../operations/repair-materials";
import type { RepairMaterialsSave } from "../../../../packages/domain/src/repair-materials";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: () => Promise<Client>, app: ReturnType<typeof createApp>, token: string;
const password = "CaSe' ", now = "20261025120000000";
beforeAll(async () => {
  engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => engine.connect(name);
  app = fresh(); const enrolled = await app.inject({ method: "POST", url: "/api/auth/enroll", payload: { code: 1, password: "Synthetic42", token: "a".repeat(64) } }); expect(enrolled.json().kind).toBe("continuar"); token = enrolled.json().session.token;
}, 60000);
afterAll(async () => { await app?.close(); await database?.end(); await engine?.stop(); }, 60000);
beforeEach(async () => {
  await app.close(); app = fresh();
  await database.query('TRUNCATE auth.mechanic_credentials,app."mecanicos",app."artigos",app."material_reparacao",app."tempos_reparacao",app."ordem_reparacao",app."estados_reparacao" RESTART IDENTITY');
  await database.query('INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES (1,7,$1,$2,false),(2,8,$3,$4,false)', ["Selected", "OLD-SYNTHETIC", "Other", "OTHER-SYNTH"]);
  await database.query(`INSERT INTO app."estados_reparacao" ("Codigo","Descricao","tipo") VALUES ('R','Reparação',3);
    INSERT INTO app."ordem_reparacao" ("numero","reparacao_mecanico","reparacao_estado") VALUES (10,7,'R');
    INSERT INTO app."artigos" ("Codigo","Descricao","preco","stock") VALUES ('A','Synthetic article',1,10)`);
});
function fresh() { return createApp({ security: createSessionSecurity(connect, { setupToken: "a".repeat(64) }), mechanicsConnect: connect, repairLaborConnect: connect, repairMaterialsConnect: connect }); }
async function post(resource: string, action: string, payload: unknown = {}) {
  const reply = await app.inject({ method: "POST", url: `/api/${resource}/${action}`, payload: JSON.stringify(payload), headers: { "content-type": "application/json", authorization: `Bearer ${token}` } });
  expect(reply.statusCode).toBe(200); expect(reply.headers["cache-control"]).toBe("no-store"); return reply.json();
}
const values = (secret: string | null = password) => ({ Codigo: 7, Descricao: "Selected", palavra_passe: secret, inativo: false });
async function reset(secret = password) { const result = await post("mechanics", "save", { mode: "update", id: "1", values: values(secret) }); expect(result.kind).toBe("saved"); }
async function authLabor() { return post("repair-labor", "authenticate", { mechanic: 7, password }); }
async function materialCommand(): Promise<RepairMaterialsSave> {
  const read = await post("repair-materials", "read", { numero: "10" }); expect(read.kind).toBe("loaded");
  return { orderId: read.document.orderId, numero: "10", state: "R", baseline: read.document.baseline, rows: [{ id: null, data_hora: now, mecanico: 7, artigo: "A", descricao_artigo: "Synthetic article", quantidade: "1", preco: "1", lancado: false }], proofs: [] };
}
async function snapshot() { return (await database.query('SELECT (SELECT COALESCE(jsonb_agg(to_jsonb(m)),\'[]\') FROM app."material_reparacao" m) AS materials,(SELECT COALESCE(jsonb_agg(to_jsonb(t)),\'[]\') FROM app."tempos_reparacao" t) AS labor,(SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=\'A\') AS stock')).rows; }

it("ADR004 production selected read is blank, rejects copied credentials with no fallback and preserves all source rows until explicit reset", async () => {
  const read = await post("mechanics", "read", { id: "1" }); expect(read).toMatchObject({ kind: "loaded", mechanic: { palavra_passe: null, credentialManaged: false } }); expect(JSON.stringify(read)).not.toContain("OLD-SYNTHETIC");
  expect(await post("repair-labor", "authenticate", { mechanic: 7, password: "OLD-SYNTHETIC" })).toEqual({ kind: "denied" });
  expect(await post("repair-materials", "authenticate", { code: 7, password: "OLD-SYNTHETIC" })).toEqual({ kind: "incorrect" });
  expect((await database.query('SELECT count(*)::text AS count FROM auth.mechanic_credentials')).rows[0].count).toBe("0");
  expect((await database.query('SELECT "palavra_passe" FROM app."mecanicos" ORDER BY _row_id')).rows).toEqual([{ palavra_passe: "OLD-SYNTHETIC" }, { palavra_passe: "OTHER-SYNTH" }]);
});

it("ADR004 actual maintenance explicitly hashes selected case-sensitive text, clears only that raw field and creates managed source byte255", async () => {
  await reset(); const credential = (await database.query('SELECT password_hash,version::text FROM auth.mechanic_credentials WHERE mechanic_id=1')).rows[0];
  expect(credential.version).toBe("1"); expect(credential.password_hash).toMatch(/^scrypt\$v1\$131072\$8\$1\$/); expect(await verifyPassword(password, credential.password_hash)).toBe(true); expect(await verifyPassword(password.toUpperCase(), credential.password_hash)).toBe(false);
  expect((await database.query('SELECT "palavra_passe" FROM app."mecanicos" ORDER BY _row_id')).rows).toEqual([{ palavra_passe: null }, { palavra_passe: "OTHER-SYNTH" }]);
  expect(await post("mechanics", "read", { id: "1" })).toMatchObject({ mechanic: { palavra_passe: null, credentialManaged: true } });
  const created = await post("mechanics", "save", { mode: "create", values: { ...values("xYz"), Codigo: 255 } }); expect(created.kind).toBe("saved"); expect(created.mechanic.Codigo).toBe(255); expect(JSON.stringify(created)).not.toMatch(/password_hash|palavra_passe|xYz/);
  expect((await database.query('SELECT "mecanicosID"::text,"palavra_passe" FROM app."mecanicos" WHERE "Codigo"=255')).rows).toEqual([{ mecanicosID: "3", palavra_passe: null }]);
});

it("ADR004 managed blank maintenance retains hash/revision, source required precedence stays exact and unmanaged unchanged cannot bypass explicit reset", async () => {
  await reset(); const before = (await database.query('SELECT * FROM auth.mechanic_credentials')).rows;
  expect((await post("mechanics", "save", { mode: "update", id: "1", passwordUnchanged: true, values: { ...values(null), Descricao: "Renamed" } })).kind).toBe("saved"); expect((await database.query('SELECT * FROM auth.mechanic_credentials')).rows).toEqual(before);
  for (const [changed, message] of [[{ Codigo: 0 }, "Falta indicar o código"], [{ Descricao: "" }, "Falta preencher a descrição"], [{ palavra_passe: "" }, "Falta indicar a palavra-passe"]] as const) expect(await post("mechanics", "save", { mode: "update", id: "1", values: { ...values(), ...changed } })).toEqual({ kind: "required", message });
  expect(await post("mechanics", "save", { mode: "update", id: "2", passwordUnchanged: true, values: { ...values(null), Codigo: 8 } })).toEqual({ kind: "invalid" });
  expect(await post("mechanics", "save", { mode: "update", id: "1", values: { ...values(), Codigo: 8 } })).toEqual({ kind: "codeLocked" });
  expect((await database.query('SELECT * FROM auth.mechanic_credentials')).rows).toEqual(before);
});

it("source-specific exact password/missing/cancel/inactive rules survive production transition and Time does not acquire an inactive guard", async () => {
  await reset(); expect((await authLabor()).credentialRevision).toBe("1:1");
  expect(await post("repair-labor", "authenticate", { mechanic: 7, password: password.toUpperCase() })).toEqual({ kind: "denied" });
  expect(await post("repair-labor", "authenticate", { mechanic: 7, password: "" })).toEqual({ kind: "denied" });
  expect(await post("repair-materials", "authenticate", { code: 7, password: "" })).toEqual({ kind: "cancelled", mechanic: { Codigo: 7, Descricao: "Selected", inativo: false } });
  expect(await post("repair-materials", "authenticate", { code: 99, password })).toEqual({ kind: "missing" });
  await database.query('UPDATE app."mecanicos" SET "inativo"=true WHERE _row_id=1');
  expect((await authLabor()).kind).toBe("authenticated"); expect(await post("repair-materials", "authenticate", { code: 7, password })).toEqual({ kind: "inactive" });
});

it("actual production labor prepare/toggle and materials save require a current revision and persist real business effects", async () => {
  await reset(); const authenticated = await authLabor(), proof = { mechanic: 7, password, credentialRevision: authenticated.credentialRevision };
  expect(await post("repair-labor", "prepare", { numero: "10", proof: { mechanic: 7, password } })).toEqual({ kind: "denied" });
  const plan = await post("repair-labor", "prepare", { numero: "10", proof }); expect(plan.kind).toBe("prepared");
  expect(await post("repair-labor", "toggle", { numero: "10", proof, baseline: plan.baseline, now, closeOthers: [], state: null })).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "mecanico","inicio","fim" FROM app."tempos_reparacao"')).rows).toEqual([{ mecanico: 7, inicio: now, fim: "00000000000000000" }]);
  const draft = await materialCommand(), before = await snapshot(); draft.proofs = [{ code: 7, password }]; expect(await post("repair-materials", "save", draft)).toEqual({ kind: "incorrect" }); expect(await snapshot()).toEqual(before);
  draft.proofs[0].credentialRevision = authenticated.credentialRevision; draft.rows.push({ ...draft.rows[0], data_hora: "20261025120001000" });
  expect(await post("repair-materials", "save", draft)).toEqual({ kind: "saved" }); expect((await database.query('SELECT "stock"::text FROM app."artigos"')).rows).toEqual([{ stock: "8" }]);
});

it("same-password reset and deletion invalidate retained production proofs before any material/labor mutation", async () => {
  await reset(); const first = await authLabor(), proof = { mechanic: 7, password, credentialRevision: first.credentialRevision }, plan = await post("repair-labor", "prepare", { numero: "10", proof }), draft = await materialCommand(); draft.proofs = [{ code: 7, password, credentialRevision: first.credentialRevision }]; const before = await snapshot();
  await reset(); expect((await authLabor()).credentialRevision).toBe("1:2");
  expect(await post("repair-labor", "toggle", { numero: "10", proof, baseline: plan.baseline, now, closeOthers: [], state: null })).toEqual({ kind: "denied" }); expect(await post("repair-materials", "save", draft)).toEqual({ kind: "incorrect" }); expect(await snapshot()).toEqual(before);
  const current = await authLabor(); expect(await post("mechanics", "delete", { id: "1" })).toEqual({ kind: "deleted" }); expect((await database.query('SELECT count(*)::text AS count FROM auth.mechanic_credentials')).rows[0].count).toBe("0");
  expect(await post("repair-labor", "prepare", { numero: "10", proof: { ...proof, credentialRevision: current.credentialRevision } })).toEqual({ kind: "denied" }); expect(await snapshot()).toEqual(before);
});

it("reset and delete failure roll back credential and source edits together without a partial success", async () => {
  await reset(); const before = (await database.query('SELECT to_jsonb(m) AS row FROM app."mecanicos" m ORDER BY _row_id')).rows, credentials = (await database.query('SELECT * FROM auth.mechanic_credentials')).rows;
  await database.query("CREATE FUNCTION public.refuse_mechanic_credentials() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic'; END $$; CREATE TRIGGER refuse_credentials BEFORE UPDATE OR DELETE ON auth.mechanic_credentials FOR EACH ROW EXECUTE FUNCTION public.refuse_mechanic_credentials()");
  try { expect(await post("mechanics", "save", { mode: "update", id: "1", values: { ...values("Replacement"), Descricao: "Must rollback" } })).toEqual({ kind: "failed" }); expect(await post("mechanics", "delete", { id: "1" })).toEqual({ kind: "failed" }); expect((await database.query('SELECT to_jsonb(m) AS row FROM app."mecanicos" m ORDER BY _row_id')).rows).toEqual(before); expect((await database.query('SELECT * FROM auth.mechanic_credentials')).rows).toEqual(credentials); }
  finally { await database.query('DROP TRIGGER refuse_credentials ON auth.mechanic_credentials; DROP FUNCTION public.refuse_mechanic_credentials()'); }
});

it("a failed first explicit reset cannot clear copied raw text or publish a partial managed credential", async () => {
  await database.query("CREATE FUNCTION public.refuse_first_mechanic_reset() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic'; END $$; CREATE TRIGGER refuse_first_reset BEFORE INSERT ON auth.mechanic_credentials FOR EACH ROW EXECUTE FUNCTION public.refuse_first_mechanic_reset()");
  try { expect(await post("mechanics", "save", { mode: "update", id: "1", values: { ...values(), Descricao: "Must rollback" } })).toEqual({ kind: "failed" }); expect((await database.query('SELECT "Descricao","palavra_passe" FROM app."mecanicos" WHERE _row_id=1')).rows).toEqual([{ Descricao: "Selected", palavra_passe: "OLD-SYNTHETIC" }]); expect((await database.query('SELECT count(*)::text AS count FROM auth.mechanic_credentials')).rows[0].count).toBe("0"); }
  finally { await database.query('DROP TRIGGER refuse_first_reset ON auth.mechanic_credentials; DROP FUNCTION public.refuse_first_mechanic_reset()'); }
});

for (const action of ["reset", "delete"] as const) it(`coordinated actual material verification serializes concurrent ${action} and later rejects the old revision without lock inversion`, async () => {
  await reset(); const authenticated = await authLabor(), draft = await materialCommand(); draft.proofs = [{ code: 7, password, credentialRevision: authenticated.credentialRevision }];
  let enter!: () => void, release!: () => void; const entered = new Promise<void>(resolve => { enter = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
  const observed = async () => { const client = await connect(), original = client.query.bind(client); client.query = (async (...args: Parameters<Client["query"]>) => { if (typeof args[0] === "string" && args[0].startsWith("SELECT password_hash,version")) { enter(); await gate; } return original(...args); }) as Client["query"]; return client; };
  const mutation = saveRepairMaterials(observed, draft, createMechanicCredentials()("synthetic-race")); let changing: Promise<{ kind: string }> | undefined;
  try {
    await entered; changing = action === "reset" ? saveSecureMechanic(connect, { mode: "update", id: "1", values: values() }) : deleteSecureMechanic(connect, { id: "1" });
    await expect.poll(async () => (await database.query("SELECT EXISTS(SELECT 1 FROM pg_locks l JOIN pg_class c ON c.oid=l.relation WHERE c.relname='mecanicos' AND NOT l.granted) AS waiting")).rows[0].waiting).toBe(true);
    release(); expect(await mutation).toEqual({ kind: "saved" }); expect((await changing).kind).toBe(action === "reset" ? "saved" : "deleted");
    expect((await database.query('SELECT "stock"::text FROM app."artigos"')).rows).toEqual([{ stock: "9" }]); expect(await post("repair-labor", "prepare", { numero: "10", proof: { mechanic: 7, password, credentialRevision: authenticated.credentialRevision } })).toEqual({ kind: "denied" });
  } finally { release(); await mutation; await changing; }
}, 20000);

it("bounded failed password window expires and valid recurring current proofs consume no failed-attempt allowance", async () => {
  await reset(); let at = 0; const policy = createMechanicCredentials({ now: () => at })("synthetic-address");
  for (let i = 0; i < 10; i++) expect(await authenticateRepairLabor(connect, { mechanic: 7, password: "wrong" }, policy)).toEqual({ kind: "denied" });
  expect(await authenticateRepairLabor(connect, { mechanic: 7, password }, policy)).toEqual({ kind: "denied" }); at = 60000;
  for (let i = 0; i < 12; i++) expect((await authenticateRepairLabor(connect, { mechanic: 7, password }, policy)).kind).toBe("authenticated");
}, 20000);

it("actual production mechanic maintenance and credential-consuming endpoints deny direct anonymous calls", async () => {
  for (const url of ["/api/mechanics/read", "/api/mechanics/save", "/api/mechanics/delete", "/api/repair-labor/authenticate", "/api/repair-labor/toggle", "/api/repair-materials/authenticate", "/api/repair-materials/save"]) { const reply = await app.inject({ method: "POST", url, payload: {} }); expect(reply.statusCode).toBe(401); expect(reply.json()).toEqual({ kind: "unauthenticated" }); }
  expect((await database.query('SELECT count(*)::text AS count FROM auth.mechanic_credentials')).rows[0].count).toBe("0");
});
