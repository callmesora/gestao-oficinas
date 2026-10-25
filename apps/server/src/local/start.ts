import { parseArgs } from "node:util";
import { startLocalService } from "./service";
import { LocalServiceError } from "./profile";
let running: Awaited<ReturnType<typeof startLocalService>> | undefined, interrupted = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => { interrupted = true; void running?.close().catch(() => { console.error("Não foi possível fechar o serviço local próprio."); process.exitCode = 1; }); });
try {
  let selectedDirectory: string | undefined;
  try { selectedDirectory = parseArgs({ options: { profile: { type: "string" } }, strict: true, allowPositionals: false }).values.profile; }
  catch { throw new LocalServiceError("unexpected_arguments"); }
  if (selectedDirectory === "") throw new LocalServiceError("existing_profile_required");
  running = await startLocalService({ directory: selectedDirectory });
  if (interrupted) await running.close(); else console.log(`Gestão de Oficinas: ${running.origin}`);
} catch (error) { console.error(error instanceof LocalServiceError ? error.message : "Não foi possível iniciar o serviço local. Verifique a configuração e as portas."); process.exitCode = 1; }
