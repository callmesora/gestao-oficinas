import { parseArgs } from "node:util";
import { backupLocalService } from "./backup-store";
import { LocalServiceError } from "./profile";
const abort = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => abort.abort());
try {
  const { values } = parseArgs({ options: { profile: { type: "string" }, out: { type: "string" }, tools: { type: "string" } }, strict: true, allowPositionals: false });
  if (!values.out || !values.tools || values.profile === "") throw new LocalServiceError("backup_arguments_required");
  const result = await backupLocalService({ directory: values.profile, destination: values.out, toolsDirectory: values.tools, signal: abort.signal });
  console.log(`Cópia local verificada: ${result.directory}. Tabelas: ${result.tables}; registos: ${result.rows}.`);
} catch (error) { console.error(error instanceof LocalServiceError ? error.message : "Não foi possível criar a cópia local. Verifique os argumentos e o estado existente."); process.exitCode = 1; }
