import { afterAll,beforeAll,beforeEach,describe,expect,it } from "vitest";
import type { Client } from "pg";
import {startIsolatedPostgres} from "../../test-support/postgres";
import {migrate} from "../db/migrate";
import {createApp} from "../app";
import type {DatabaseConnection} from "../db/connection";

let engine:Awaited<ReturnType<typeof startIsolatedPostgres>>,database:Client,connect:DatabaseConnection,api:ReturnType<typeof createApp>;
const zero="00000000000000000",now="20261026120000000";
beforeAll(async()=>{engine=await startIsolatedPostgres();database=await engine.database();await migrate(database);const name=(await database.query<{name:string}>("SELECT current_database() AS name")).rows[0].name;connect=()=>engine.connect(name);api=createApp({repairLaborConnect:connect,authenticate:async()=>({userId:"synthetic-proof-repair"})});},60000);
afterAll(async()=>{await api?.close();await database?.end();await engine?.stop();},60000);
beforeEach(async()=>{
  await database.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao",app."estados_reparacao",app."mecanicos",app."Viaturas",app."sistema" RESTART IDENTITY;
    INSERT INTO app."sistema" ("Tempo_tempos","encerrar_tempos1","encerrar_tempos2") VALUES (18446744073709551615,'120000','180000'),(1,'010000','020000');
    INSERT INTO app."estados_reparacao" ("Codigo","Descricao","tipo","lancar_defa") VALUES ('R','Atual',3,TRUE),('F','Final',6,NULL),('R','Duplicado',3,FALSE),(NULL,'Sem código',4,NULL),('X','Fora',7,FALSE);
    INSERT INTO app."mecanicos" ("Codigo","Descricao","palavra_passe","inativo") VALUES (2,'ANA','Synthetic',FALSE),(10,'BRUNO','Other',TRUE),(NULL,'NULL',NULL,NULL);
    INSERT INTO app."Viaturas" ("matricula","marca","modelo") VALUES ('AA','MARCA','MODELO'),('BB','OUTRA','MODELO');
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","reparacao_mecanico","reparacao_estado","reparacao_estado_historico") VALUES (1,9007199254740993,'AA',2,'R',''),(2,20,'BB',2,'F',''),(3,30,'BB',10,'R','')`);
});
async function post(action:string,payload:unknown){const response=await api.inject({method:"POST",url:`/api/repair-labor/${action}`,headers:{"content-type":"application/json"},payload:JSON.stringify(payload)});expect(response.statusCode).toBe(200);return response.json();}
async function snapshot(){return (await database.query('SELECT to_jsonb(t)::text AS row FROM app."tempos_reparacao" t ORDER BY _row_id')).rows;}
async function insertLabor(id:number,numero:string,mechanic:number,start:string|null,finish:string|null=zero,state:string|null="START"){
  await database.query('INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim","Inicio_reparacao_estado","fim_reparacao_estado") VALUES ($1,$2,$3,$4,$5,$6,\'UNTOUCHED\')',[id,numero,mechanic,start,finish,state]);
}

describe("proof repair labor initialization and clock transactions",()=>{
  it("uses first raw settings and source ordered nullable duplicate states and all mechanics while closing only prior-day literal zero17 buffers",async()=>{
    await insertLabor(1,"9007199254740993",2,"20261025100000123",zero,"ORIGINAL START");
    await insertLabor(2,"20",2,"20261026100000000",zero,"TODAY");await insertLabor(3,"30",10,"20261027100000000",zero,"FUTURE");
    await insertLabor(4,"20",10,"20261024100000000","","EMPTY");await insertLabor(5,"20",10,"20261024100000000",null,"NULL");
    const result=await post("initialise",{now});expect(result.kind).toBe("loaded");
    expect(result.settings).toEqual({Tempo_tempos:"18446744073709551615",encerrar_tempos1:"120000",encerrar_tempos2:"180000"});
    expect(result.states.map((row:{Codigo:string|null;tipo:number;lancar_defa:boolean|null})=>[row.Codigo,row.tipo,row.lancar_defa])).toEqual([["R",3,true],["R",3,false],[null,4,null],["F",6,null]]);
    expect(result.mechanics.map((row:{Codigo:number|null;Descricao:string})=>[row.Codigo,row.Descricao])).toEqual([[2,"ANA"],[10,"BRUNO"],[null,"NULL"]]);
    expect((await database.query('SELECT "tempos_reparacaoID"::text AS id,"inicio","fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY _row_id')).rows).toEqual([
      {id:"1",inicio:"20261025100000123",fim:"20261025180000000",fim_reparacao_estado:"ORIGINAL START"},
      {id:"2",inicio:"20261026100000000",fim:zero,fim_reparacao_estado:"UNTOUCHED"},{id:"3",inicio:"20261027100000000",fim:zero,fim_reparacao_estado:"UNTOUCHED"},
      {id:"4",inicio:"20261024100000000",fim:"",fim_reparacao_estado:"UNTOUCHED"},{id:"5",inicio:"20261024100000000",fim:null,fim_reparacao_estado:"UNTOUCHED"}]);
  });
  it("retains source first-buffer update scope across multiple open starts for the same order and mechanic",async()=>{
    await insertLabor(1,"20",2,"20261024100000000",zero,"FIRST");await insertLabor(2,"20",2,"20261025110000000",zero,"SECOND");await insertLabor(3,"20",2,"20261026110000000",zero,"TODAY");
    expect((await post("initialise",{now})).kind).toBe("loaded");
    expect((await database.query('SELECT "fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY _row_id')).rows).toEqual(Array.from({length:3},()=>({fim:"20261024180000000",fim_reparacao_estado:"FIRST"})));
  });
  for(const bad of [null,"not a date","00000000000000000"] as const) it(`rolls back earlier closure writes when a later open start is ${String(bad)}`,async()=>{
    await insertLabor(1,"20",2,"20261024100000000");await insertLabor(2,"30",10,bad);const before=await snapshot();
    expect(await post("initialise",{now})).toEqual({kind:"unsupported"});expect(await snapshot()).toEqual(before);
  });
  it("missing first closure configuration preserves every open raw row and releases the transaction for a later supported initialization",async()=>{
    await insertLabor(1,"20",2,"20261024100000000");await database.query('UPDATE app."sistema" SET "encerrar_tempos2"=NULL WHERE _row_id=1');const before=await snapshot();
    expect(await post("initialise",{now})).toEqual({kind:"unsupported"});expect(await snapshot()).toEqual(before);
    await database.query('UPDATE app."sistema" SET "encerrar_tempos2"=\'180000\' WHERE _row_id=1');expect((await post("initialise",{now})).kind).toBe("loaded");
    expect((await database.query('SELECT "fim" FROM app."tempos_reparacao"')).rows[0].fim).toBe("20261024180000000");
  });
  for(const [clock,closes] of [["20261026115959999",false],["20261026120000000",true],["20261026123000000",true],["20261026123000001",false],["20261026180000000",true],["20261026183000000",true],["20261026183000001",false]] as const) it(`real tick ${clock} ${closes?"closes":"preserves"} at the exact two source inclusive30-minute windows`,async()=>{
    await insertLabor(1,"20",2,"20261026100000000");await insertLabor(2,"30",10,"20261026110000000");
    expect(await post("tick",{now:clock,visible:[{numero:"9007199254740993",mechanic:2,state:"R"}]})).toEqual({kind:"saved"});
    expect((await database.query('SELECT "numero"::text,"fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY _row_id')).rows).toEqual([
      {numero:"20",fim:closes?clock:zero,fim_reparacao_estado:closes?"R":"UNTOUCHED"},{numero:"30",fim:zero,fim_reparacao_estado:"UNTOUCHED"}]);
  });
  it("tick preserves the source visible-order-state assignment across other orders but rolls all writes back for a later stale visible buffer",async()=>{
    await insertLabor(1,"20",2,"20261026100000000");await insertLabor(2,"30",10,"20261026110000000");const before=await snapshot();
    expect(await post("tick",{now,visible:[{numero:"9007199254740993",mechanic:2,state:"R"},{numero:"30",mechanic:10,state:"STALE"}]})).toEqual({kind:"stale"});expect(await snapshot()).toEqual(before);
    expect(await post("tick",{now,visible:[{numero:"9007199254740993",mechanic:2,state:"R"},{numero:"30",mechanic:10,state:"R"}]})).toEqual({kind:"saved"});
    expect((await database.query('SELECT "numero"::text,"fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY _row_id')).rows).toEqual([{numero:"20",fim:now,fim_reparacao_estado:"R"},{numero:"30",fim:now,fim_reparacao_estado:"R"}]);
  });
});
