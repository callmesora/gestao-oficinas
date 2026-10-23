import Fastify from "fastify";

export function createApp() {
  const app = Fastify({ logger: false });
  app.get("/health/live", async () => ({ service: "gestao-oficinas-api", status: "alive" }));
  return app;
}
