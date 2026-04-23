// Re-encrypt secrets/fb-cookies.json into BOT_COOKIES_ENC for .env.local / Vercel.
//
// Usage:
//   node scripts/encrypt-cookies.mjs
//   node scripts/encrypt-cookies.mjs --in secrets/fb-cookies.json
//
// Reads BOT_COOKIE_KEY from .env.local (or env). Prints BOT_COOKIES_ENC=... to stdout.

import { createCipheriv, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readEnvLocalKey() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    const m = raw.match(/^BOT_COOKIE_KEY=(.+)$/m);
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
  } catch {
    return null;
  }
}

function encryptCookie(plaintext, keyHex) {
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error(`BOT_COOKIE_KEY must be 32-byte hex (64 chars), got ${key.length} bytes`);
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

const args = process.argv.slice(2);
const inIdx = args.indexOf("--in");
const inPath = inIdx >= 0 ? args[inIdx + 1] : "secrets/fb-cookies.json";

const keyHex = process.env.BOT_COOKIE_KEY ?? readEnvLocalKey();
if (!keyHex) {
  console.error("BOT_COOKIE_KEY not found in env or .env.local");
  process.exit(1);
}

const cookieJson = readFileSync(resolve(process.cwd(), inPath), "utf8").trim();
JSON.parse(cookieJson); // validate

const encrypted = encryptCookie(cookieJson, keyHex);
console.log(`BOT_COOKIES_ENC=${encrypted}`);
