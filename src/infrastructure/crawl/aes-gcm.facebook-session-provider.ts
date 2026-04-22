import { createDecipheriv } from "node:crypto";

import type { FacebookSessionProvider } from "@/application/crawl/ports";
import type { FacebookBotRepository } from "@/application/crawl/ports";

// Cookie format stored in BOT_COOKIES_ENC: base64(iv[12] + tag[16] + ciphertext)
// Key stored in BOT_COOKIE_KEY: 32-byte hex string
export class AesGcmFacebookSessionProvider implements FacebookSessionProvider {
  constructor(private botRepo: FacebookBotRepository) {}

  async getActiveSession(): Promise<{ botId: string; cookie: string } | null> {
    const bot = await this.botRepo.findActive();
    if (!bot) return null;

    const keyHex = process.env.BOT_COOKIE_KEY;
    if (!keyHex) throw new Error("BOT_COOKIE_KEY env var is required");

    const key = Buffer.from(keyHex, "hex");
    const cookie = decrypt(bot.cookieEncrypted, key);
    return { botId: bot.id, cookie };
  }
}

function decrypt(encryptedB64: string, key: Buffer): string {
  const buf = Buffer.from(encryptedB64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function encryptCookie(plaintext: string, keyHex: string): string {
  const { createCipheriv, randomBytes } = require("node:crypto") as typeof import("node:crypto");
  const key = Buffer.from(keyHex, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}
