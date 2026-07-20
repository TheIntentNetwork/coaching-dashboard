/**
 * Decrypt platform field encryption used by sustainable-website.
 * Format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTED_PREFIX = "enc:v1:";

function getKey(): Buffer | null {
  const key = process.env.ENCRYPTION_KEY || process.env.BANK_ENCRYPTION_KEY;
  if (!key) return null;
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, "hex");
  }
  return crypto.createHash("sha256").update(key).digest();
}

export function isEncryptedField(value: string | null | undefined): boolean {
  return Boolean(value && value.startsWith(ENCRYPTED_PREFIX));
}

export function decryptField(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith(ENCRYPTED_PREFIX)) return value;

  const key = getKey();
  if (!key) return null;

  try {
    const payload = value.slice(ENCRYPTED_PREFIX.length);
    const [ivHex, tagHex, encrypted] = payload.split(":");
    if (!ivHex || !tagHex || !encrypted) return null;
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}
