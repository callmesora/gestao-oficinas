import type { FastifyInstance } from "fastify";
import { lstat, readFile, realpath } from "node:fs/promises";
import { resolve, sep, extname, join } from "node:path";
import tauri from "../../../../src-tauri/tauri.conf.json" with { type: "json" };
import { LocalServiceError } from "./profile";
const contentTypes: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff": "font/woff", ".woff2": "font/woff2", ".ico": "image/x-icon" };
/** Public production build only: no repository fallback, source maps, arbitrary paths or SPA API fallback. */
export async function validateLocalFrontend(directory: string): Promise<string> {
  let root: string;
  try { root = await realpath(directory); const metadata = await lstat(join(root, "index.html")); if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error(); }
  catch { throw new LocalServiceError("built_frontend_required"); }
  return root;
}
export async function mountLocalFrontend(app: FastifyInstance, directory: string): Promise<void> {
  const root = await validateLocalFrontend(directory);
  app.get("/", async (_request, reply) => reply.header("X-Content-Type-Options", "nosniff").header("Cache-Control", "no-store").header("Content-Security-Policy", tauri.app.security.csp).type(contentTypes[".html"]).send(await readFile(join(root, "index.html"))));
  app.get<{ Params: { "*": string } }>("/assets/*", async (request, reply) => {
    try {
      const supplied = request.params["*"], extension = extname(supplied).toLowerCase(), target = resolve(root, "assets", supplied), assets = join(root, "assets") + sep;
      if (!target.startsWith(assets) || !contentTypes[extension] || extension === ".html" || supplied.includes("\0") || (await lstat(target)).isSymbolicLink() || await realpath(target) !== target || !(await lstat(target)).isFile()) return reply.code(404).send();
      return reply.header("X-Content-Type-Options", "nosniff").header("Cache-Control", "public, max-age=31536000, immutable").type(contentTypes[extension]).send(await readFile(target));
    } catch { return reply.code(404).send(); }
  });
}
