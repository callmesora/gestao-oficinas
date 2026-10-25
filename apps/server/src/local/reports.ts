import { parseArgs } from "node:util";
import { LocalServiceError } from "./profile";
import { provisionLocalReportRuntime } from "./report-runtime";

const abort = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => abort.abort());
try {
  const { values } = parseArgs({ options: { executable: { type: "string" }, replace: { type: "boolean" }, profile: { type: "string" } }, strict: true, allowPositionals: false });
  if (!values.executable) throw new LocalServiceError("report_executable_required");
  if (values.profile === "") throw new LocalServiceError("existing_profile_required");
  const result = await provisionLocalReportRuntime({ directory: values.profile, executable: values.executable, replace: values.replace, signal: abort.signal });
  console.log(`Runtime de relatórios configurado no ficheiro privado: ${result.pinFile}`);
} catch (error) {
  console.error(error instanceof LocalServiceError ? error.message : "Não foi possível configurar o runtime de relatórios local."); process.exitCode = 1;
}
