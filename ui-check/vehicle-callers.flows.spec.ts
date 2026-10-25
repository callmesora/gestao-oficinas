import { expect, test, type APIRequestContext, type Locator, type Page, type Request } from "@playwright/test";
import type { Customer, CustomerValues } from "../packages/domain/src/customers";
import type { Vehicle, VehicleValues } from "../packages/domain/src/vehicles";

async function records(request: APIRequestContext) {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const { token } = await session.json(), headers = { Authorization: `Bearer ${token}` };
  const customers: Customer[] = [], registrations = new Set<string>();
  const stamp = Date.now().toString();
  return {
    stamp, headers,
    async customer(label: string) {
      const values: CustomerValues = { Codigo: `${stamp}${customers.length}`, Descricao: `${label} ${stamp}`, Morada1: "", Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: "" };
      const result = await (await request.post("/api/customers/save", { headers, data: { mode: "create", values } })).json();
      expect(result.kind).toBe("saved");
      customers.push(result.customer);
      return result.customer as Customer;
    },
    async vehicle(values: VehicleValues) {
      registrations.add(values.matricula);
      const result = await (await request.post("/api/vehicles/save", { headers, data: { mode: "create", values } })).json();
      expect(result.kind).toBe("saved");
      return result.vehicles[0] as Vehicle;
    },
    trackVehicle(registration: string) { registrations.add(registration); },
    async lookup(registration: string) {
      return (await request.post("/api/vehicles/lookup", { headers, data: { registration } })).json();
    },
    async removeVehicle(registration: string) {
      const result = await (await request.post("/api/vehicles/delete", { headers, data: { registration } })).json();
      expect(result.kind).toBe("deleted");
    },
    async cleanup() {
      for (const registration of registrations) {
        const result = await (await request.post("/api/vehicles/delete", { headers, data: { registration } })).json();
        expect(["deleted", "missing"]).toContain(result.kind);
      }
      for (const customer of customers) {
        const result = await (await request.post("/api/customers/delete", { headers, data: { id: customer.id } })).json();
        expect(result.kind).toBe("deleted");
      }
    },
  };
}

async function newVehicle(page: Page, registration: string, customer: Customer, model: string) {
  await page.goto("/?workflow=vehicles"); await page.getByTestId("vehicles-open").click();
  await page.getByTestId("WIN_Table_Viaturas").getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_Viaturas");
  await fillVehicle(form, registration, customer, model);
  return form;
}

async function fillVehicle(form: Locator, registration: string, customer: Customer, model: string) {
  await form.getByTestId("EDT_Matricula").fill(registration);
  await form.getByTestId("COMBO_Codigo").selectOption(customer.Codigo!);
  await form.getByTestId("EDT_Marca").fill("Marca caller  ");
  await form.getByTestId("EDT_Modelo").fill(model);
  await form.getByTestId("EDT_Ano").fill("2026"); await form.getByTestId("EDT_Mes").fill("10");
}

async function customerRow(picker: Locator, description: string) {
  await picker.getByTestId("BTN_descricao").click(); await picker.getByTestId("EDT_termo_pesquisa").fill(description);
  const row = picker.getByTestId("TABLE_Clientes").getByRole("row").filter({ hasText: description });
  await expect(picker.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(row).toBeVisible();
  return row;
}

async function editPickerCustomer(page: Page, picker: Locator, before: string, after: string) {
  await (await customerRow(picker, before)).click(); await picker.getByTestId("BTN_Modificar").click();
  const form = page.getByTestId("WIN_Form_Clientes");
  await form.getByTestId("EDT_Descricao").fill(after); await form.getByTestId("BTN_Validar").click();
  await expect(form).toHaveCount(0); await expect(picker.getByTestId("BTN_Modificar")).toBeEnabled();
}

test("SRC-a29b466a64 editing and selecting in the real customer picker refreshes the vehicle combo labels", async ({ page, request }) => {
  const data = await records(request), customer = await data.customer("Caller selected"), other = await data.customer("Caller outside filter");
  const registration = `E${data.stamp}`, description = `Edited caller ${data.stamp}`;
  data.trackVehicle(registration);
  try {
    const vehicle = await newVehicle(page, registration, customer, "Draft before customer edit");
    await vehicle.getByTestId("BTN_VISION").click(); const picker = page.getByTestId("customer-picker");
    await editPickerCustomer(page, picker, customer.Descricao!, description);
    await (await customerRow(picker, description)).click(); await picker.getByTestId("BTN_selecionar").click();
    await expect(picker).toHaveCount(0);
    const combo = vehicle.getByTestId("COMBO_Codigo");
    await expect(combo).toHaveValue(customer.Codigo!);
    await expect(combo.getByRole("option", { name: description, exact: true })).toHaveAttribute("value", customer.Codigo!);
    await expect(combo.getByRole("option", { name: customer.Descricao!, exact: true })).toHaveCount(0);
    // Closing the source list deactivates its filter; an unrelated real customer remains available.
    await expect(combo.getByRole("option", { name: other.Descricao!, exact: true })).toHaveAttribute("value", other.Codigo!);
    await expect(vehicle.getByTestId("EDT_Modelo")).toHaveValue("Draft before customer edit");
    await vehicle.getByTestId("BTN_Validar").click(); await expect(vehicle).toHaveCount(0);
    expect((await data.lookup(registration)).vehicle).toMatchObject({ Cliente: customer.Codigo, marca: "Marca caller  ", modelo: "Draft before customer edit", Ano: 2026, mes: 10 });
  } finally { await data.cleanup(); }
});

test("SRC-a29b466a64 nonempty-origin cancellation awaits its actual combo reload and blocks competing vehicle operations", async ({ page, request }) => {
  const data = await records(request), customer = await data.customer("Caller cancellation");
  const registration = `K${data.stamp}`, description = `Cancelled picker edit ${data.stamp}`;
  data.trackVehicle(registration);
  let release!: () => void;
  let held = false, saves = 0;
  const gate = new Promise<void>(resolve => { release = resolve; });
  page.on("request", value => { if (value.url().endsWith("/api/vehicles/save")) saves++; });
  try {
    const vehicle = await newVehicle(page, registration, customer, "Draft while return pending");
    await vehicle.getByTestId("BTN_VISION").click(); const picker = page.getByTestId("customer-picker");
    await editPickerCustomer(page, picker, customer.Descricao!, description);
    await page.route("**/api/customers/list", async route => {
      const response = await route.fetch(), filter = route.request().postDataJSON();
      if (filter.mode === "todos" && filter.term === "") { held = true; await gate; }
      await route.fulfill({ response });
    });
    // No selection action: Fechar returns the existing nonempty origin, which still requires ListDisplay.
    await picker.getByTestId("BTN_Fechar").click(); await expect(picker).toHaveCount(0);
    await expect.poll(() => held).toBe(true);
    for (const name of ["BTN_Validar", "BTN_Cancelar", "BTN_VISION", "COMBO_Codigo", "EDT_Matricula", "EDT_Marca", "EDT_Modelo", "EDT_Ano", "EDT_Mes"]) await expect(vehicle.getByTestId(name)).toBeDisabled();
    await page.keyboard.press("Enter"); await page.keyboard.press("Escape");
    await vehicle.getByTestId("BTN_SYST_FERMER").click();
    await expect(vehicle).toBeVisible(); await expect(vehicle.getByTestId("EDT_Modelo")).toHaveValue("Draft while return pending");
    expect(saves).toBe(0); expect((await data.lookup(registration)).kind).toBe("missing");
    release(); await expect(vehicle.getByTestId("BTN_Validar")).toBeEnabled();
    await page.unroute("**/api/customers/list");
    await expect(vehicle.getByTestId("COMBO_Codigo")).toHaveValue(customer.Codigo!);
    await expect(vehicle.getByTestId("COMBO_Codigo").getByRole("option", { name: description, exact: true })).toHaveAttribute("value", customer.Codigo!);
    await expect(vehicle.getByTestId("EDT_Matricula")).toHaveValue(registration);
    await vehicle.getByTestId("EDT_Modelo").fill("Saved after actual reload");
    await vehicle.getByTestId("BTN_Validar").click(); await expect(vehicle).toHaveCount(0);
    expect(saves).toBe(1); expect((await data.lookup(registration)).vehicle).toMatchObject({ Cliente: customer.Codigo, modelo: "Saved after actual reload" });
  } finally { release(); await page.unroute("**/api/customers/list"); await data.cleanup(); }
});

for (const initialOutcome of ["response", "failure"] as const) test(`SRC-a29b466a64 late initial customer ${initialOutcome} cannot overwrite the real picker refresh`, async ({ page, request }) => {
  const data = await records(request), customer = await data.customer("Initially delayed customer");
  const registration = `L${data.stamp}`, description = `Fresh picker label ${data.stamp}`;
  data.trackVehicle(registration);
  let release!: () => void, pickerOpened = false, captured = 0;
  const initial: Request[] = [];
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/customers/list", async route => {
    const filter = route.request().postDataJSON();
    if (!pickerOpened && filter.mode === "todos" && filter.term === "") {
      initial.push(route.request());
      const response = await route.fetch();
      expect((await response.json()).customers.find((row: Customer) => row.id === customer.id)?.Descricao).toBe(customer.Descricao);
      captured++;
      await gate;
      if (initialOutcome === "response") await route.fulfill({ response });
      else await route.abort("failed"); // Real request captured above; fail only its delivery, without a fake payload.
    } else await route.continue();
  });
  try {
    await page.goto("/?workflow=vehicles"); await page.getByTestId("vehicles-open").click(); await page.getByTestId("Btn_New").click();
    const form = page.getByTestId("WIN_Form_Viaturas"), combo = form.getByTestId("COMBO_Codigo");
    await form.getByTestId("EDT_Matricula").fill(registration); await form.getByTestId("EDT_Marca").fill("Delayed read");
    await form.getByTestId("EDT_Modelo").fill("Preserved draft");
    // Hold every mount read, including StrictMode's replay; holding only its discarded first read is vacuous.
    await expect.poll(() => initial.length).toBeGreaterThan(0);
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect.poll(() => captured).toBe(initial.length);
    pickerOpened = true;
    await form.getByTestId("BTN_VISION").click(); const picker = page.getByTestId("customer-picker");
    await editPickerCustomer(page, picker, customer.Descricao!, description);
    await (await customerRow(picker, description)).click(); await picker.getByTestId("BTN_selecionar").click();
    await expect(combo.getByRole("option", { name: description, exact: true })).toHaveAttribute("value", customer.Codigo!);
    const stale = initialOutcome === "response"
      ? Promise.all(initial.map(request => page.waitForResponse(response => response.request() === request).then(response => response.finished())))
      : Promise.all(initial.map(request => page.waitForEvent("requestfailed", failed => failed === request)));
    release(); await stale;
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(combo.getByRole("option", { name: description, exact: true })).toHaveAttribute("value", customer.Codigo!);
    await expect(combo.getByRole("option", { name: customer.Descricao!, exact: true })).toHaveCount(0);
    await expect(form.getByTestId("vehicle-form-diagnostic")).toHaveCount(0);
    await expect(combo).toHaveValue(customer.Codigo!); await expect(form.getByTestId("EDT_Modelo")).toHaveValue("Preserved draft");
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect((await data.lookup(registration)).vehicle).toMatchObject({ Cliente: customer.Codigo, modelo: "Preserved draft" });
  } finally { release(); await page.unroute("**/api/customers/list"); await data.cleanup(); }
});

test("ADR-003 separate page/application vehicle instances retain their own drafts and customer-picker results", async ({ page, context, request }) => {
  const data = await records(request), firstCustomer = await data.customer("First page caller"), secondCustomer = await data.customer("Second page caller");
  const firstRegistration = `I${data.stamp}`, secondRegistration = `J${data.stamp}`, secondPage = await context.newPage();
  data.trackVehicle(firstRegistration); data.trackVehicle(secondRegistration);
  try {
    const first = await newVehicle(page, firstRegistration, firstCustomer, "First page draft");
    const second = await newVehicle(secondPage, secondRegistration, secondCustomer, "Second page draft");
    await first.getByTestId("BTN_VISION").click(); const firstPicker = page.getByTestId("customer-picker");
    await second.getByTestId("BTN_VISION").click(); const secondPicker = secondPage.getByTestId("customer-picker");
    await (await customerRow(firstPicker, secondCustomer.Descricao!)).click(); await firstPicker.getByTestId("BTN_selecionar").click();
    await expect(firstPicker).toHaveCount(0); await expect(first.getByTestId("COMBO_Codigo")).toHaveValue(secondCustomer.Codigo!);
    await expect(secondPicker).toBeVisible();
    await (await customerRow(secondPicker, firstCustomer.Descricao!)).click(); await secondPicker.getByTestId("BTN_selecionar").click();
    await expect(secondPicker).toHaveCount(0); await expect(second.getByTestId("COMBO_Codigo")).toHaveValue(firstCustomer.Codigo!);
    await expect(first.getByTestId("EDT_Modelo")).toHaveValue("First page draft"); await expect(second.getByTestId("EDT_Modelo")).toHaveValue("Second page draft");
    await first.getByTestId("EDT_Modelo").fill("First page final"); await first.getByTestId("BTN_Validar").click(); await expect(first).toHaveCount(0);
    await expect(second.getByTestId("EDT_Matricula")).toHaveValue(secondRegistration); await expect(second.getByTestId("EDT_Modelo")).toHaveValue("Second page draft");
    await second.getByTestId("BTN_Validar").click(); await expect(second).toHaveCount(0);
    expect((await data.lookup(firstRegistration)).vehicle).toMatchObject({ Cliente: secondCustomer.Codigo, modelo: "First page final" });
    expect((await data.lookup(secondRegistration)).vehicle).toMatchObject({ Cliente: firstCustomer.Codigo, modelo: "Second page draft" });
  } finally { await secondPage.close(); await data.cleanup(); }
});

test("SRC-48aefe45e0 SRC-8523ffdea4 reselect prior registration after actual new/save and edit/cancel refreshes", async ({ page, request }) => {
  const data = await records(request), customer = await data.customer("Prior registration caller");
  const prefix = `R${data.stamp}`, prior = `${prefix}B`, created = `${prefix}C`;
  const values = (matricula: string, modelo: string): VehicleValues => ({ matricula, Cliente: customer.Codigo, marca: "Prior caller", modelo, Ano: 2026, mes: 10 });
  await data.vehicle(values(`${prefix}A`, "Other row")); const original = await data.vehicle(values(prior, "Original prior"));
  data.trackVehicle(created);
  try {
    await page.goto("/?workflow=vehicles"); await page.getByTestId("vehicles-open").click();
    const list = page.getByTestId("WIN_Table_Viaturas"), table = list.getByTestId("TABLE_Viaturas");
    await list.getByTestId("BTN_matricula").click(); await list.getByTestId("EDT_termo_pesquisa").fill(prefix);
    const row = table.getByRole("row").filter({ hasText: prior });
    await expect(list.getByTestId("Btn_New")).toBeEnabled(); await row.click(); await expect(row).toHaveAttribute("aria-selected", "true");
    await list.getByTestId("Btn_New").click(); const form = page.getByTestId("WIN_Form_Viaturas");
    await fillVehicle(form, created, customer, "Created other registration");
    // Keep the sought registration present at refresh, but replace its internal identity through the real API.
    // Mere retention of the old selected id cannot satisfy the explicit source TableSeek.
    await data.removeVehicle(prior); const replacement = await data.vehicle(values(prior, "Replacement before new return"));
    expect(replacement.id).not.toBe(original.id);
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    await expect(row).toContainText("Replacement before new return"); await expect(row).toHaveAttribute("aria-selected", "true");
    await expect(table.getByRole("row").filter({ hasText: created })).toHaveAttribute("aria-selected", "false");
    await list.getByTestId("BTN_Modificar").click(); await expect(form.getByTestId("EDT_Matricula")).toHaveValue(prior);
    await form.getByTestId("EDT_Modelo").fill("Cancelled form draft");
    await data.removeVehicle(prior); const afterCancel = await data.vehicle(values(prior, "Replacement before edit return"));
    expect(afterCancel.id).not.toBe(replacement.id);
    await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0);
    await expect(row).toContainText("Replacement before edit return"); await expect(row).toHaveAttribute("aria-selected", "true");
    expect((await data.lookup(prior)).vehicle.modelo).toBe("Replacement before edit return");
  } finally { await data.cleanup(); }
});
