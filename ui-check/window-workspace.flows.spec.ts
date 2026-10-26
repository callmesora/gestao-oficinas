import type { Locator, Page, TestInfo } from "@playwright/test";
import { expect, test } from "./support/local-service";

async function loginBuiltApp(page: Page, server: { origin: string; setupToken: string }) {
  expect(new URL(server.origin).port).not.toBe("3210");
  await page.goto(server.origin);
  const access = page.getByTestId("WIN_Acesso"), setup = page.getByTestId("authentication-enrollment");
  await expect(access.or(setup)).toBeVisible();
  if (await setup.isVisible()) {
    await setup.getByLabel("Código de configuração").fill(server.setupToken);
    await setup.getByLabel("Nova palavra-passe").fill("Synthetic42"); await setup.getByTestId("enrollment-confirm").click();
    await expect(page.getByTestId("WIN_MENU")).toBeVisible(); await page.getByTestId("business-logout").click();
  }
  await expect(access).toBeVisible(); await access.getByTestId("BTN_NoName1").click();
  await page.getByTestId("user-picker").getByRole("cell", { name: "Administrador", exact: true }).dblclick();
  await access.getByTestId("EDT_palavra_passe").fill("synthetic42"); await access.getByTestId("BTN_Confirmar").click();
  await expect(page.getByTestId("WIN_MENU")).toBeVisible();
}

async function windowFor(page: Page, screen: string) {
  const window = page.locator(".wd-workspace-window").filter({ has: page.getByTestId(screen) });
  await expect(window).toHaveCount(1); return window;
}

async function gutterRaster(page: Page, frame: Locator, testInfo: TestInfo, phase: string, sourceOffset?: { x: number; y: number }) {
  const bounds = (await frame.boundingBox())!;
  const canvasTop = await frame.evaluate(element => element.closest(".wd-workspace-canvas")!.getBoundingClientRect().top);
  // Source frame border is 8px; Articles controls start at x=14. Focus may scroll
  // the frame above the clipped canvas. Keep this whole empty client strip visible,
  // then reuse its exact source-local position when lower windows disappear.
  const offset = sourceOffset ?? { x: 9, y: Math.max(60, Math.ceil(canvasTop - bounds.y) + 1) };
  const clip = { x: Math.floor(bounds.x + offset.x), y: Math.floor(bounds.y + offset.y), width: 3, height: 96 };
  const png = await page.screenshot({ clip });
  const result = await page.evaluate(async bytes => {
    const image = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: "image/png" }));
    const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext("2d")!; context.drawImage(image, 0, 0); image.close();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const digest = await crypto.subtle.digest("SHA-256", pixels);
    return { hash: [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join(""), pixel: [...pixels.slice(0, 4)] };
  }, [...png]);
  const geometry = await frame.evaluate((element, clip) => {
    const rect = (value: Element) => value.getBoundingClientRect().toJSON();
    const canvas = element.closest(".wd-workspace-canvas")!;
    const controls = Array.from(element.querySelectorAll<HTMLElement>("[data-control-path], input, button, .wd-table")).map(control => {
      const bounds = control.getBoundingClientRect();
      return { name: control.dataset.testid ?? control.dataset.controlPath ?? control.tagName, bounds: bounds.toJSON(), intersects: bounds.width > 0 && bounds.height > 0 && bounds.x < clip.x + clip.width && bounds.right > clip.x && bounds.y < clip.y + clip.height && bounds.bottom > clip.y };
    }).filter(control => control.intersects);
    const search = element.querySelector<HTMLInputElement>('[data-testid="EDT_termo_pesquisa"]')!;
    const todos = element.querySelector<HTMLElement>('[data-testid="BTN_todos"]')!;
    return { clip, frame: rect(element), canvas: rect(canvas), canvasScroll: { x: canvas.scrollLeft, y: canvas.scrollTop }, documentScroll: { x: scrollX, y: scrollY }, activeElement: (document.activeElement as HTMLElement)?.dataset.testid, search: { bounds: rect(search), selectionStart: search.selectionStart, selectionEnd: search.selectionEnd, scrollLeft: search.scrollLeft }, todos: { bounds: rect(todos), hover: todos.matches(":hover"), image: getComputedStyle(todos).borderImageSource }, controls };
  }, clip);
  await testInfo.attach(`${phase}-gutter`, { body: png, contentType: "image/png" });
  await testInfo.attach(`${phase}-gutter-state`, { body: JSON.stringify({ ...result, offset, geometry }), contentType: "application/json" });
  const viewport = page.viewportSize()!;
  expect(clip.x, "opacity sample must lie inside the visible frame client").toBeGreaterThanOrEqual(Math.max(geometry.frame.x + 8, geometry.canvas.x, 0));
  expect(clip.x + clip.width).toBeLessThanOrEqual(Math.min(geometry.frame.right - 8, geometry.canvas.right, viewport.width));
  expect(clip.y).toBeGreaterThanOrEqual(Math.max(geometry.frame.y + 25, geometry.canvas.y, 0));
  expect(clip.y + clip.height).toBeLessThanOrEqual(Math.min(geometry.frame.bottom - 8, geometry.canvas.bottom, viewport.height));
  expect(geometry.controls, "opacity sample must contain no source control paint").toEqual([]);
  return { ...result, offset };
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 900, height: 700 }]) {
  test(`built production desktop ${viewport.width}x${viewport.height} keeps overlapping real business windows opaque, reachable and independently focused`, async ({ page, localServiceServer }, testInfo) => {
    test.setTimeout(90000); await page.setViewportSize(viewport);
    const requests: string[] = []; page.on("request", request => requests.push(new URL(request.url()).pathname));
    const imageResponses: { path: string; status: number; contentType: string }[] = [];
    page.on("response", response => {
      const path = new URL(response.url()).pathname;
      if (/\.(png|jpe?g|gif|webp|svg)$/i.test(path)) imageResponses.push({ path, status: response.status(), contentType: response.headers()["content-type"] ?? "" });
    });
    const failedImages: string[] = [];
    page.on("requestfailed", request => { if (request.resourceType() === "image") failedImages.push(new URL(request.url()).pathname); });
    await loginBuiltApp(page, localServiceServer);
    const menu = page.getByTestId("WIN_MENU");
    await menu.getByTestId("BTN_Clientes").click(); const customers = await windowFor(page, "WIN_Table_Clientes");
    await customers.getByTestId("EDT_termo_pesquisa").fill("foco cliente");
    await menu.getByTestId("BTN_Viaturas").click(); const vehicles = await windowFor(page, "WIN_Table_Viaturas");
    await menu.getByTestId("BTN_Artigos").click(); const articles = await windowFor(page, "WIN_Table_artigos");
    await articles.getByTestId("EDT_termo_pesquisa").fill("foco artigo");
    await expect(articles).toHaveAttribute("data-active", "true");
    const frame = articles.getByTestId(`${await articles.getAttribute("data-testid")}-frame`);
    const geometry = await frame.evaluate(element => {
      const frame = element.getBoundingClientRect(), canvas = element.closest(".wd-workspace-canvas")!;
      const area = canvas.getBoundingClientRect(); return { frame: { x: frame.x, y: frame.y, width: frame.width, height: frame.height }, area: { x: area.x, y: area.y, width: canvas.clientWidth, height: canvas.clientHeight }, scrollWidth: canvas.scrollWidth, scrollHeight: canvas.scrollHeight, documentWidth: document.documentElement.scrollWidth };
    });
    await testInfo.attach("production-desktop-geometry", { body: JSON.stringify(geometry), contentType: "application/json" });
    expect.soft(geometry.documentWidth, "the business desktop must not widen the document").toBeLessThanOrEqual(viewport.width);
    if (viewport.height >= 1000) {
      expect.soft(geometry.frame.y + geometry.frame.height, "a source 600px business window must fit the desktop's useful height").toBeLessThanOrEqual(geometry.area.y + geometry.area.height + 1);
    }
    expect(geometry.scrollWidth).toBeGreaterThanOrEqual(geometry.frame.width);
    expect(geometry.scrollHeight).toBeGreaterThanOrEqual(geometry.frame.height);
    const close = articles.getByRole("button", { name: "Fechar", exact: true }).first();
    const chrome = (await close.boundingBox())!;
    expect.soft(chrome.x, "top window close stays within the visible workspace").toBeGreaterThanOrEqual(geometry.area.x);
    expect.soft(chrome.x + chrome.width).toBeLessThanOrEqual(Math.min(viewport.width, geometry.area.x + geometry.area.width) + 1);
    expect.soft(chrome.y + chrome.height).toBeLessThanOrEqual(Math.min(viewport.height, geometry.area.y + geometry.area.height) + 1);
    await testInfo.attach("production-image-responses", { body: JSON.stringify(imageResponses), contentType: "application/json" });
    expect.soft(imageResponses.filter(response => response.status >= 400), "all composed desktop image URLs must be served by the built application").toEqual([]);
    expect.soft(failedImages, "built desktop images must load successfully").toEqual([]);
    const asset = await frame.evaluate(async element => {
      const source = getComputedStyle(element, "::before").borderImageSource, match = /url\(["']?(.*?)["']?\)/.exec(source);
      if (!match) return { source, width: 0, height: 0 };
      const image = new Image(); image.src = match[1]; await image.decode(); return { source, width: image.naturalWidth, height: image.naturalHeight };
    });
    expect(asset.width).toBeGreaterThan(0); expect(asset.height).toBeGreaterThan(0);
    expect(imageResponses).toContainEqual(expect.objectContaining({ path: "/skin/MediaPlayer_Bg_Base.png", status: 200, contentType: "image/png" }));
    await articles.getByTestId("EDT_termo_pesquisa").focus(); const layered = await gutterRaster(page, frame, testInfo, "layered");
    await testInfo.attach("production-overlapping-windows", { body: await page.screenshot(), contentType: "image/png" });
    const customerId = await customers.getAttribute("data-testid"), vehicleId = await vehicles.getAttribute("data-testid"), articleId = await articles.getAttribute("data-testid");
    await page.getByTestId(`${customerId}-task`).click(); await expect(customers.getByTestId("EDT_termo_pesquisa")).toBeFocused();
    await expect(customers.getByTestId("EDT_termo_pesquisa")).toHaveValue("foco cliente"); await customers.getByRole("button", { name: "Minimizar", exact: true }).click();
    await page.getByTestId(`${vehicleId}-task`).click(); await vehicles.getByRole("button", { name: "Minimizar", exact: true }).click();
    await page.getByTestId(`${articleId}-task`).click(); await expect(articles).toHaveAttribute("data-active", "true");
    await expect(articles.getByTestId("EDT_termo_pesquisa")).toBeFocused(); await expect(articles.getByTestId("EDT_termo_pesquisa")).toHaveValue("foco artigo");
    const alone = await gutterRaster(page, frame, testInfo, "alone", layered.offset);
    await testInfo.attach("production-alone-window", { body: await page.screenshot(), contentType: "image/png" });
    expect.soft(layered.hash, "pixels inside the top window cannot change when only lower windows disappear").toBe(alone.hash);
    expect.soft(alone.pixel[3]).toBe(255); expect.soft(alone.pixel.slice(0, 3).reduce((sum, value) => sum + value, 0) / 3, "source client fill must not fall back to a huge black panel").toBeGreaterThan(100);
    const documentPosition = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
    await articles.getByTestId("BTN_Fechar").scrollIntoViewIfNeeded();
    const bottomAction = (await articles.getByTestId("BTN_Fechar").boundingBox())!;
    expect(bottomAction.y).toBeGreaterThanOrEqual(geometry.area.y);
    expect(bottomAction.y + bottomAction.height).toBeLessThanOrEqual(geometry.area.y + geometry.area.height + 1);
    expect(await page.evaluate(() => ({ x: scrollX, y: scrollY })), "source bottom actions must scroll inside the workspace, without moving the whole document").toEqual(documentPosition);
    await page.getByTestId("workspace-canvas").evaluate(element => { element.scrollTop = 0; element.scrollLeft = 0; });
    await close.click(); await expect(articles).toHaveCount(0);
    await page.getByTestId(`${customerId}-task`).click(); await expect(customers).toHaveAttribute("data-active", "true");
    await expect(customers.getByTestId("EDT_termo_pesquisa")).toBeFocused(); await customers.getByRole("button", { name: "Fechar", exact: true }).first().click(); await expect(customers).toHaveCount(0);
    await page.getByTestId(`${vehicleId}-task`).click(); await vehicles.getByRole("button", { name: "Fechar", exact: true }).first().click(); await expect(vehicles).toHaveCount(0);
    await expect(page.locator(".wd-workspace-window")).toHaveCount(0);
    expect(imageResponses.filter(response => response.status >= 400)).toEqual([]); expect(failedImages).toEqual([]);
    expect(requests).not.toContain("/api/development/session"); expect(requests).not.toContain("/@vite/client"); expect(requests).not.toContain("/src/main.tsx");
  });
}
