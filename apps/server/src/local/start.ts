import { startLocalService } from "./service";
import { LocalServiceError } from "./profile";
let running: Awaited<ReturnType<typeof startLocalService>> | undefined, interrupted = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => { interrupted = true; void running?.close().catch(() => { console.error("Não foi possível fechar o serviço local próprio."); process.exitCode = 1; }); });
try {
  if (process.argv.length !== 2) throw new LocalServiceError("unexpected_arguments");
  running = await startLocalService();
  if (interrupted) await running.close(); else console.log(`Gestão de Oficinas: ${running.origin}`);
} catch (error) { console.error(error instanceof LocalServiceError ? error.message : "Não foi possível iniciar o serviço local. Verifique a configuração e as portas."); process.exitCode = 1; }
