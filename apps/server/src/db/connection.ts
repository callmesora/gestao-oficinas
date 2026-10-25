import type { Client } from "pg";

/** Each operation owns and closes the connected client it acquires. */
export type DatabaseConnection = () => Promise<Client>;

export async function connectOperationClient(connect: DatabaseConnection): Promise<Client | null> {
  try {
    const client = await connect();
    // pg rejects pending/subsequent queries and also emits this connection error.
    // Own the event through close; query promises retain the operation's typed failure path.
    // Never log connection errors here: their diagnostics can contain private values.
    client.on("error", () => undefined);
    return client;
  } catch { return null; }
}

/** Failure cleanup cannot replace the original error or its domain classification. */
export async function rollbackAfterFailure(client: Client): Promise<void> {
  try { await client.query("ROLLBACK"); } catch { /* The server may already have disconnected. */ }
}

/** A completed operation retains its result if closing its owned connection fails. */
export async function closeOperationClient(client: Client): Promise<void> {
  try { await client.end(); } catch { /* Best-effort close, without a new business result. */ }
}
