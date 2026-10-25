import { expect, test } from "./support/authentication";
test("SRC-e0dfacbe65 persistent cold service initializes only source system defaults before access and preserves them after Cancel", async ({ page, request, authenticationServer, authenticationDatabase }) => {
  const created = await request.post(`${authenticationServer.origin}/api/auth/enroll`, { data: { code: 1, password: "Synthetic42", token: authenticationServer.setupToken } }); expect((await created.json()).kind).toBe("continuar");
  await authenticationDatabase.query('TRUNCATE app."sistema" RESTART IDENTITY'); await authenticationServer.restart();
  const expected = [{ Tempo_ordem_reparacao: "15", Tempo_materiais: "15", Tempo_tempos: "15", Data_inicio: 7, encerrar_tempos1: "030000", encerrar_tempos2: "030000" }];
  const read = async () => (await authenticationDatabase.query('SELECT "Tempo_ordem_reparacao"::text,"Tempo_materiais"::text,"Tempo_tempos"::text,"Data_inicio","encerrar_tempos1","encerrar_tempos2" FROM app."sistema"')).rows;
  expect(await read()).toEqual(expected); await page.goto(authenticationServer.origin); const access = page.getByTestId("WIN_Acesso"); await expect(access).toBeVisible(); await expect(page.getByTestId("WIN_MENU")).toHaveCount(0); const denied = await request.post(`${authenticationServer.origin}/api/startup/initialise`, { data: {} }); expect(denied.status()).toBe(401);
  await access.getByTestId("BTN_Cancelar").click(); await expect(page.getByTestId("startup-terminated")).toBeVisible(); expect(await read()).toEqual(expected); await authenticationServer.restart(); expect(await read()).toEqual(expected);
});
