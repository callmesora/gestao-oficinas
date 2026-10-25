import Fastify from "fastify";
import { mkdtemp, mkdir, writeFile, rm, symlink, copyFile, readFile, unlink } from "node:fs/promises";
import { resolve, join } from "node:path";
import { afterAll, beforeAll, expect, it } from "vitest";
import { mountLocalFrontend } from "./frontend";
let directory: string;
beforeAll(async () => { directory = await mkdtemp(resolve("analysis-local/local-frontend-test-")); await mkdir(join(directory, "assets")); await writeFile(join(directory, "index.html"), '<!doctype html><script type="module" src="/assets/app.js"></script>'); await writeFile(join(directory, "assets", "app.js"), 'document.title="Synthetic built app"'); await writeFile(join(directory, "private.json"), '{"private":"synthetic"}'); });
afterAll(async () => { await rm(directory, { recursive: true }); });
it("ADR017 serves only confined built assets with actual MIME/nosniff/CSP and no source/private/API fallback", async () => {
  const app = Fastify(); await mountLocalFrontend(app, directory);
  try {
    const index = await app.inject("/"); expect(index.statusCode).toBe(200); expect(index.headers["content-type"]).toContain("text/html"); expect(index.headers["x-content-type-options"]).toBe("nosniff"); expect(index.headers["content-security-policy"]).toContain("http://127.0.0.1:3210");
    const asset = await app.inject("/assets/app.js"); expect(asset.statusCode).toBe(200); expect(asset.headers["content-type"]).toContain("text/javascript"); expect(asset.headers["x-content-type-options"]).toBe("nosniff"); expect(asset.body).toBe('document.title="Synthetic built app"');
    for (const path of ["/private.json", "/src/main.tsx", "/api/not-found", "/assets/../private.json", "/assets/%2e%2e%2fprivate.json", "/assets/app.js.map", "/assets/missing.js"]) expect((await app.inject(path)).statusCode, path).toBe(404);
    if (process.platform !== "win32") { await symlink(join(directory, "private.json"), join(directory, "assets", "leak.js")); expect((await app.inject("/assets/leak.js")).statusCode).toBe(404); }
  } finally { await app.close(); }
});
it("ADR017 missing production build is refused", async () => { const app = Fastify(); try { await expect(mountLocalFrontend(app, join(directory, "missing"))).rejects.toThrow("built_frontend_required"); } finally { await app.close(); } });
it("ADR003 ADR017 serves exact checked skin PNG bytes for built windows and refuses unlisted, traversed, linked and private files", async () => {
  const skin = join(directory, "skin"), name = "MediaPlayer_Bg_Base.png";
  await mkdir(skin); const original = new URL("../../../../public/skin/MediaPlayer_Bg_Base.png", import.meta.url);
  await copyFile(original, join(skin, name)); await writeFile(join(skin, "unlisted.png"), "not a checked asset");
  const app = Fastify(); await mountLocalFrontend(app, directory);
  try {
    const response = await app.inject(`/skin/${name}`);
    expect(response.statusCode).toBe(200); expect(response.headers["content-type"]).toBe("image/png"); expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["cache-control"]).toBe("no-cache"); expect(response.rawPayload).toEqual(await readFile(original));
    for (const path of ["/skin/unlisted.png", "/skin/../private.json", "/skin/%2e%2e%2fprivate.json", "/skin/MediaPlayer_Bg_Base.png.js", "/skin/missing.png"]) expect((await app.inject(path)).statusCode, path).toBe(404);
    if (process.platform !== "win32") {
      await unlink(join(skin, name)); await symlink(original, join(skin, name));
      expect((await app.inject(`/skin/${name}`)).statusCode).toBe(404);
    }
  } finally { await app.close(); }
});
