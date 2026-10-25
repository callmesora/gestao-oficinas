import type { DatabaseConnection } from "./db/connection";
import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
import { checkCustomerDelete, deleteCustomer, listCustomers, saveCustomer } from "./operations/customers";
import type { developmentSessions } from "./development-sessions";
import { checkVehicleDelete, deleteVehicle, listVehicles, lookupVehicle, saveVehicle } from "./operations/vehicles";
import { checkUnitDelete, deleteUnit, listUnits, saveUnit } from "./operations/units";

import { listDescriptiveStates, saveDescriptiveState, deleteDescriptiveState } from "./operations/descriptive-states";

import { listTerminals, saveTerminal, deleteTerminal, prepareTerminalFolder } from "./operations/terminals";
import { listPostos, savePosto, deletePosto } from "./operations/postos";

export function createApp(options: { customerConnect?: DatabaseConnection; vehicleConnect?: DatabaseConnection; unitConnect?: DatabaseConnection; descriptiveStateConnect?: DatabaseConnection; terminalConnect?: DatabaseConnection; postoConnect?: DatabaseConnection; authenticate?: (request: FastifyRequest) => Promise<{ userId: string } | null>; development?: ReturnType<typeof developmentSessions> } = {}) {
  const app = Fastify({ logger: false });
  app.get("/health/live", async () => ({ service: "gestao-oficinas-api", status: "alive" }));
  const authenticate = options.authenticate ?? options.development?.authenticate;
  if (options.development) app.post("/api/development/session", async (request, reply) => {
    if (request.headers.origin !== options.development!.origin || request.headers["x-isolated-development"] !== "1") return reply.code(403).send({ kind: "denied" });
    reply.header("Cache-Control", "no-store");
    return { token: options.development!.issue() };
  });
  app.post("/api/customers/list", async (request, reply) => {
    if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
    if (!options.customerConnect) return reply.code(503).send({ kind: "unavailable" });
    return listCustomers(options.customerConnect, request.body);
  });
  app.post("/api/customers/save", async (request, reply) => {
    const principal = await authenticate?.(request);
    if (!principal) return reply.code(401).send({ kind: "unauthenticated" });
    if (!options.customerConnect) return reply.code(503).send({ kind: "unavailable" });
    return saveCustomer(options.customerConnect, request.body);
  });
  app.post("/api/customers/delete", async (request, reply) => {
    const principal = await authenticate?.(request);
    if (!principal) return reply.code(401).send({ kind: "unauthenticated" });
    if (!options.customerConnect) return reply.code(503).send({ kind: "unavailable" });
    return deleteCustomer(options.customerConnect, request.body);
  });
  app.post("/api/customers/check-delete", async (request, reply) => {
    if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
    if (!options.customerConnect) return reply.code(503).send({ kind: "unavailable" });
    return checkCustomerDelete(options.customerConnect, request.body);
  });
  for (const [action, operation] of Object.entries({ list: listVehicles, lookup: lookupVehicle, save: saveVehicle, delete: deleteVehicle, "check-delete": checkVehicleDelete })) {
    app.post(`/api/vehicles/${action}`, async (request, reply) => {
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.vehicleConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.vehicleConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ list: listUnits, save: saveUnit, delete: deleteUnit, "check-delete": checkUnitDelete })) {
    app.post(`/api/units/${action}`, async (request, reply) => {
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.unitConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.unitConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ list: listDescriptiveStates, save: saveDescriptiveState, delete: deleteDescriptiveState })) {
    app.post(`/api/descriptive-states/${action}`, async (request, reply) => {
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.descriptiveStateConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.descriptiveStateConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ list: listTerminals, save: saveTerminal, delete: deleteTerminal, "prepare-folder": prepareTerminalFolder })) {
    app.post(`/api/terminals/${action}`, async (request, reply) => {
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.terminalConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.terminalConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ list: listPostos, save: savePosto, delete: deletePosto })) {
    app.post(`/api/postos/${action}`, async (request, reply) => {
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.postoConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.postoConnect, request.body);
    });
  }
  return app;
}
