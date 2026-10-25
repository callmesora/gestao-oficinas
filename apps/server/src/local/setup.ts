import { parseArgs } from "node:util";
import { setupLocalService } from "./service";
import { LocalServiceError } from "./profile";
const abort = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => abort.abort());
try {
  const { values } = parseArgs({ options: { snapshot: { type: "string" }, "database-port": { type: "string" } }, strict: true, allowPositionals: false });
  if (values.snapshot !== undefined && values.snapshot === "") throw new LocalServiceError("snapshot_invalid");
  const result = await setupLocalService({ snapshot: values.snapshot, ...(values["database-port"] !== undefined ? { databasePort: Number(values["database-port"]) } : {}), signal: abort.signal });
  console.log(`Serviço local preparado. Código de configuração no ficheiro privado: ${result.tokenFile}`);
  console.log(`Registos importados: ${result.imported}. Inicie com npm run local:start.`);
} catch (error) {
  console.error(error instanceof LocalServiceError ? error.message : "Não foi possível preparar o serviço local. Verifique os argumentos e o estado existente."); process.exitCode = 1;
}
