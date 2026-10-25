import { parseArgs } from "node:util";
import { restoreLocalService } from "./backup-store";
import { LocalServiceError } from "./profile";
const abort = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => abort.abort());
try {
  const { values } = parseArgs({ options: { profile: { type: "string" }, backup: { type: "string" }, tools: { type: "string" }, "database-port": { type: "string" }, "api-port": { type: "string" } }, strict: true, allowPositionals: false });
  if (!values.profile || !values.backup || !values.tools || !values["database-port"] || !values["api-port"]) throw new LocalServiceError("restore_arguments_required");
  const result = await restoreLocalService({ directory: values.profile, backup: values.backup, toolsDirectory: values.tools, databasePort: Number(values["database-port"]), apiPort: Number(values["api-port"]), signal: abort.signal });
  console.log(`Cópia restaurada e verificada num perfil separado: ${result.directory}. Tabelas: ${result.tables}; sessões invalidadas: ${result.invalidatedSessions}.`);
  if (result.tokenFile) console.log(`Código de configuração no novo ficheiro privado: ${result.tokenFile}`);
} catch (error) { console.error(error instanceof LocalServiceError ? error.message : "Não foi possível restaurar a cópia local. Verifique os argumentos e o destino novo."); process.exitCode = 1; }
