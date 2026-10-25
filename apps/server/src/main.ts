import { createBusinessApp } from "./business-app";
import { readServiceConfiguration } from "./configuration";
import { createConfiguredReportRenderer } from "./reports/runtime";

try {
  const configuration = await readServiceConfiguration();
  const app = await createBusinessApp(configuration, await createConfiguredReportRenderer(process.env));
  await app.listen({ host: configuration.host, port: configuration.port });
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => { void app.close().then(() => process.exit(0)); });
  }
} catch {
  // Connection strings, operator tokens and third-party diagnostics are private.
  console.error("Não foi possível iniciar o serviço. Verifique a configuração e a disponibilidade da base de dados.");
  process.exitCode = 1;
}
