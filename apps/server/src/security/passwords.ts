import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// ADR004; OWASP scrypt minimum. The parameters are fixed/versioned, never caller supplied.
const N = 131072, r = 8, p = 1, length = 64, maxmem = 256 * 1024 * 1024;
let activeHashes = 0;
export class HashCapacityError extends Error {}
async function derive(password: string, salt: Buffer): Promise<Buffer> {
  if (activeHashes >= 2) throw new HashCapacityError("Authentication busy");
  activeHashes++;
  try { return await new Promise<Buffer>((resolve, reject) => scrypt(password, salt, length, { N, r, p, maxmem }, (error, key) => error ? reject(error) : resolve(key))); }
  finally { activeHashes--; }
}
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16), key = await derive(password, salt);
  return `scrypt$v1$${N}$${r}$${p}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}
export async function verifyPassword(password: string, envelope: string): Promise<boolean> {
  const match = /^scrypt\$v1\$131072\$8\$1\$([A-Za-z0-9_-]{22})\$([A-Za-z0-9_-]{86})$/.exec(envelope);
  if (!match) return false;
  const salt = Buffer.from(match[1], "base64url"), expected = Buffer.from(match[2], "base64url");
  if (salt.length !== 16 || expected.length !== length || salt.toString("base64url") !== match[1] || expected.toString("base64url") !== match[2]) return false;
  return timingSafeEqual(await derive(password, salt), expected);
}
