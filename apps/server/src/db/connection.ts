import type { Client } from "pg";

/** Each operation owns and closes the connected client it acquires. */
export type DatabaseConnection = () => Promise<Client>;
