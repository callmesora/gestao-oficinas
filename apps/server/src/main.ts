import { createApp } from "./app";

const app = createApp();
await app.listen({ host: "127.0.0.1", port: 3210 });
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => { void app.close().then(() => process.exit(0)); });
}
