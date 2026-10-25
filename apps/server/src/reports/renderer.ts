import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { chromium, type Browser } from "playwright-core";
import type { ReportRenderResult } from "../../../../packages/domain/src/reports";
import type { ReportDocument } from "./templates";

const require = createRequire(import.meta.url);
export type ReportAssets = { pagedScript: string; fontRegular: string; fontBold: string; notices: string };
/** Resolve only installed, pinned package assets; no CDN, user path or remote font. */
export async function loadReportAssets(moduleDirectory?: string): Promise<ReportAssets> {
  const modulePath = (name: string) => moduleDirectory ? resolve(moduleDirectory, name) : dirname(require.resolve(`${name}/package.json`));
  // pagedjs0.4.3's exports omit package.json, so resolve its installed CJS entry first.
  const pagedRoot = moduleDirectory ? resolve(moduleDirectory, "pagedjs") : resolve(dirname(require.resolve("pagedjs")), "..");
  const fontRoot = modulePath("@fontsource/noto-sans");
  const [pagedScript, regular, bold, pagedLicense, fontLicense] = await Promise.all([
    readFile(resolve(pagedRoot, "dist/paged.js"), "utf8"),
    readFile(resolve(fontRoot, "files/noto-sans-latin-400-normal.woff2")),
    readFile(resolve(fontRoot, "files/noto-sans-latin-700-normal.woff2")),
    readFile(resolve(pagedRoot, "LICENSE.md"), "utf8"), readFile(resolve(fontRoot, "LICENSE"), "utf8"),
  ]);
  return { pagedScript, fontRegular: regular.toString("base64"), fontBold: bold.toString("base64"), notices: pagedLicense + "\n" + fontLicense };
}
export type ReportRenderer = (document: ReportDocument) => Promise<ReportRenderResult>;

/** One existing Chromium stack; it owns pagination, fonts, text shaping and PDF creation.
 * Host-installed Chrome is an initial development prerequisite, not a packaged-runtime promise.
 */
export function createReportRenderer(options: { assets?: Promise<ReportAssets>; channel?: "chrome" | "chromium" } = {}): ReportRenderer {
  const assets = options.assets ?? loadReportAssets();
  // Avoid an unhandled failed lazy asset read before the first request.
  void assets.catch(() => undefined);
  let rendering = false;
  return async report => {
    if (rendering) return { kind: "unavailable" };
    rendering = true;
    let browser: Browser | undefined;
    try {
      const files = await assets;
      browser = await chromium.launch({ channel: options.channel ?? "chrome", headless: true });
      const context = await browser.newContext({ serviceWorkers: "block" });
      await context.route("**/*", route => route.abort());
      const page = await context.newPage();
      page.setDefaultTimeout(30_000);
      await page.setContent('<!doctype html><html lang="pt"><head><meta charset="utf-8"></head><body><main id="source"></main><main id="pages"></main></body></html>');
      await page.addScriptTag({ content: files.pagedScript });
      const css = `@font-face{font-family:ReportSans;src:url(data:font/woff2;base64,${files.fontRegular}) format('woff2');font-weight:400;}\n`
        + `@font-face{font-family:ReportSans;src:url(data:font/woff2;base64,${files.fontBold}) format('woff2');font-weight:700;}\n` + report.css;
      // Real font loading must finish before Paged.js measures source bands.
      await page.addStyleTag({ content: css });
      await page.evaluate(async ({ html, stylesheet }) => {
        const source = document.querySelector("#source")!;
        source.innerHTML = html;
        await document.fonts.load("8pt ReportSans");
        await document.fonts.load("700 16pt ReportSans");
        await document.fonts.ready;
        const api = window as unknown as { Paged: { Previewer: new () => { preview(source: Element, styles: Record<string, string>[], target: Element): Promise<{ total: number }> } } };
        const previewer = new api.Paged.Previewer();
        const result = await Promise.race([
          previewer.preview(source, [{ "report.css": stylesheet }], document.querySelector("#pages")!),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Report pagination timeout")), 30_000)),
        ]);
        document.documentElement.dataset.reportPages = String(result.total);
        source.remove();
      }, { html: report.html, stylesheet: css });
      const snapshot = await page.evaluate(() => {
        const styles = Array.from(document.styleSheets).flatMap(sheet => Array.from(sheet.cssRules).map(rule => rule.cssText)).join("\n");
        return { pages: Number(document.documentElement.dataset.reportPages), styles, content: document.querySelector("#pages")!.innerHTML,
          fontReady: document.fonts.check("8pt ReportSans") && document.fonts.check("700 16pt ReportSans") };
      });
      if (!snapshot.fontReady || !Number.isInteger(snapshot.pages) || snapshot.pages < 1) return { kind: "failed" };
      // Retain copyright/license notices within the offline artifact; no script in the preview.
      const notices = files.notices.replaceAll("--", "—");
      const html = `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:"><style>${snapshot.styles}</style></head><body>${snapshot.content}<!--${notices}--></body></html>`;
      // Print exactly the immutable offline preview document. This also removes Paged.js's
      // measurement/source DOM and transient stylesheet state from Chromium's print context.
      const pdfPage = await context.newPage();
      await pdfPage.setContent(html);
      await pdfPage.evaluate(() => document.fonts.ready);
      const pdf = await pdfPage.pdf({ preferCSSPageSize: true, printBackground: true });
      return { kind: "rendered", reportId: report.reportId, html, pdfBase64: pdf.toString("base64"), pageCount: snapshot.pages, unresolved: report.unresolved };
    } catch { return { kind: "failed" }; }
    finally { try { await browser?.close(); } finally { rendering = false; } }
  };
}
