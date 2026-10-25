import { reassignReceptionCustomers } from "./operations/startup-utilities";
import cors from "@fastify/cors";
import type { SessionSecurity } from "./security/sessions";
import { readSecureUser, saveSecureUser, deleteSecureUser } from "./security/users";
import { readSecureMechanic, saveSecureMechanic, deleteSecureMechanic, createMechanicCredentials } from "./security/mechanics";
import { listSalesReportStates } from "./operations/report-filters";
import { initialiseStartup, checkStartupAccess, readSystem, saveSystem } from "./operations/startup";
import { listStock, readStock, nextStockNumber, lookupStockArticle, saveStock, deleteStock, stockInventory, rebuildStock, stockScannerConfig, partitionStockScanner } from "./operations/stock";
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
import { listMechanics, readMechanic, saveMechanic, deleteMechanic } from "./operations/mechanics";
import { listRepairStates, saveRepairState, checkRepairStateDelete, deleteRepairState } from "./operations/repair-states";
import { listDocumentTypes, saveDocumentType, checkDocumentTypeDelete, deleteDocumentType } from "./operations/document-types";
import { listArticles, saveArticle, checkArticleDelete, deleteArticle } from "./operations/articles";
import { listUsers, readUser, saveUser, deleteUser } from "./operations/users";
import { initialiseRepairOrders, listRepairOrders, saveRepairOrderDefaults } from "./operations/repair-orders";
import { initialiseRepairOrderForm, resolveRepairOrderVehicle, lookupRepairOrderCustomer, checkRepairOrderVehicleChange, checkRepairOrderStateChange, prepareRepairOrderSave, saveRepairOrder, deleteRepairOrder } from "./operations/repair-order-form";

import { listRepairMaterials, readRepairMaterials, lookupRepairMaterialArticle, authenticateRepairMaterialMechanic, saveRepairMaterials } from "./operations/repair-materials";

import { initialiseRepairLabor, listRepairLabor, readRepairLabor, readRepairLaborTime, readRepairLaborStateChoices, authenticateRepairLabor, prepareRepairLabor, toggleRepairLabor, saveRepairLaborState, tickRepairLabor, saveRepairLaborMaterials, checkRepairLaborMaterials, checkRepairLaborInformation } from "./operations/repair-labor";

import { renderReport } from "./operations/reports";
import type { ReportRenderer } from "./reports/renderer";

export function createApp(options: { customerConnect?: DatabaseConnection; vehicleConnect?: DatabaseConnection; unitConnect?: DatabaseConnection; descriptiveStateConnect?: DatabaseConnection; terminalConnect?: DatabaseConnection; postoConnect?: DatabaseConnection; mechanicsConnect?: DatabaseConnection; repairStateConnect?: DatabaseConnection; documentTypeConnect?: DatabaseConnection; articleConnect?: DatabaseConnection; userConnect?: DatabaseConnection; repairOrderConnect?: DatabaseConnection; repairMaterialsConnect?: DatabaseConnection; repairLaborConnect?: DatabaseConnection; startupConnect?: DatabaseConnection; stockConnect?: DatabaseConnection; reportFilterConnect?: DatabaseConnection; reportConnect?: DatabaseConnection; reportRenderer?: ReportRenderer; reportCompany?: string; security?: SessionSecurity; origins?: readonly string[]; authenticate?: (request: FastifyRequest) => Promise<{ userId: string } | null>; development?: ReturnType<typeof developmentSessions> } = {}) {
  const app = Fastify({ logger: false });
  app.get("/health/live", async () => ({ service: "gestao-oficinas-api", status: "alive" }));
  const authenticate = options.authenticate ?? options.security?.authenticate ?? options.development?.authenticate;
  const managedMechanics = options.security ? createMechanicCredentials() : undefined;
  if (options.security) {
    const origins = new Set(options.origins ?? []);
    void app.register(cors, { origin: (origin, callback) => callback(null, origin === undefined || origins.has(origin)), methods: ["POST", "GET"], allowedHeaders: ["Content-Type", "Authorization"], credentials: false });
    app.addHook("onRequest", async (request, reply) => {
      if (request.url.startsWith("/api/")) {
        reply.header("Cache-Control", "no-store");
        if (request.headers.origin && !origins.has(request.headers.origin)) return reply.code(403).send({ kind: "denied" });
      }
    });
    for (const [action, operation] of Object.entries({ status: () => options.security!.status(), users: (request: FastifyRequest) => options.security!.users(request.body), login: (request: FastifyRequest) => options.security!.login(request.body, request.ip), enroll: (request: FastifyRequest) => options.security!.enroll(request.body, request.ip), session: (request: FastifyRequest) => options.security!.inspect(request), logout: (request: FastifyRequest) => options.security!.logout(request) })) {
      app.post(`/api/auth/${action}`, async (request, reply) => { reply.header("Cache-Control", "no-store"); return operation(request); });
    }
  }
  app.post("/api/report-filters/states", async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
    if (!options.reportFilterConnect) return reply.code(503).send({ kind: "unavailable" });
    return listSalesReportStates(options.reportFilterConnect, request.body);
  });
  app.post("/api/reports/render", { bodyLimit: 32 * 1024 * 1024 }, async (request, reply) => {
    reply.header("Cache-Control", "no-store");
    if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
    if (!options.reportRenderer) return reply.code(503).send({ kind: "unavailable" });
    return renderReport(options.reportConnect, options.reportRenderer, request.body, options.reportCompany);
  });
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
  for (const [action, operation] of Object.entries({ list: listMechanics, read: options.security ? readSecureMechanic : readMechanic, save: options.security ? saveSecureMechanic : saveMechanic, delete: options.security ? deleteSecureMechanic : deleteMechanic })) {
    app.post(`/api/mechanics/${action}`, async (request, reply) => {
      if (action === "read") reply.header("Cache-Control", "no-store");
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.mechanicsConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.mechanicsConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ list: listRepairStates, save: saveRepairState, "check-delete": checkRepairStateDelete, delete: deleteRepairState })) {
    app.post(`/api/repair-states/${action}`, async (request, reply) => {
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.repairStateConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.repairStateConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ list: listDocumentTypes, save: saveDocumentType, "check-delete": checkDocumentTypeDelete, delete: deleteDocumentType })) {
    app.post(`/api/document-types/${action}`, async (request, reply) => {
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.documentTypeConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.documentTypeConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ list: listArticles, save: saveArticle, "check-delete": checkArticleDelete, delete: deleteArticle })) {
    app.post(`/api/articles/${action}`, async (request, reply) => {
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.articleConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.articleConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ list: listUsers, read: options.security ? readSecureUser : readUser, save: options.security ? saveSecureUser : saveUser, delete: options.security ? deleteSecureUser : deleteUser })) {
    app.post(`/api/users/${action}`, async (request, reply) => {
      if (action === "read") reply.header("Cache-Control", "no-store");
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.userConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.userConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ initialise: initialiseRepairOrders, list: listRepairOrders, "save-defaults": saveRepairOrderDefaults,
    "form-initialise": initialiseRepairOrderForm, "resolve-vehicle": resolveRepairOrderVehicle, "lookup-customer": lookupRepairOrderCustomer,
    "check-vehicle-change": checkRepairOrderVehicleChange, "check-state-change": checkRepairOrderStateChange,
    "prepare-save": prepareRepairOrderSave, save: saveRepairOrder, delete: deleteRepairOrder })) {
    app.post(`/api/repair-orders/${action}`, async (request, reply) => {
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.repairOrderConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.repairOrderConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ list: listRepairMaterials, read: readRepairMaterials, article: lookupRepairMaterialArticle, authenticate: authenticateRepairMaterialMechanic, save: saveRepairMaterials })) {
    app.post(`/api/repair-materials/${action}`, async (request, reply) => {
      reply.header("Cache-Control", "no-store");
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.repairMaterialsConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.repairMaterialsConnect, request.body, managedMechanics?.(request.ip));
    });
  }
  for (const [action, operation] of Object.entries({ initialise: initialiseRepairLabor, list: listRepairLabor, read: readRepairLabor, "read-time": readRepairLaborTime, "state-choices": readRepairLaborStateChoices, authenticate: authenticateRepairLabor, prepare: prepareRepairLabor, toggle: toggleRepairLabor, state: saveRepairLaborState, tick: tickRepairLabor, "save-materials": saveRepairLaborMaterials, "check-materials": checkRepairLaborMaterials, "check-information": checkRepairLaborInformation })) {
    app.post(`/api/repair-labor/${action}`, async (request, reply) => {
      reply.header("Cache-Control", "no-store");
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.repairLaborConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.repairLaborConnect, request.body, managedMechanics?.(request.ip));
    });
  }
  for (const [action, operation] of Object.entries({ list: listStock, read: readStock, next: nextStockNumber, lookup: lookupStockArticle, save: saveStock, delete: deleteStock, inventory: stockInventory, rebuild: rebuildStock, "scanner-config": stockScannerConfig, "scanner-partition": partitionStockScanner })) {
    app.post(`/api/stock/${action}`, async (request, reply) => {
      reply.header("Cache-Control", "no-store");
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.stockConnect) return reply.code(503).send({ kind: "unavailable" });
      return operation(options.stockConnect, request.body);
    });
  }
  for (const [action, operation] of Object.entries({ initialise: initialiseStartup, access: checkStartupAccess, "system-read": readSystem, "system-save": saveSystem, "reassign-customers": reassignReceptionCustomers })) {
    app.post(`/api/startup/${action}`, async (request, reply) => {
      reply.header("Cache-Control", "no-store");
      if (!await authenticate?.(request)) return reply.code(401).send({ kind: "unauthenticated" });
      if (!options.startupConnect) return reply.code(503).send({ kind: "unavailable" });
      return options.security && action === "access" ? { kind: "invalid" } : operation(options.startupConnect, request.body);
    });
  }
  return app;
}
