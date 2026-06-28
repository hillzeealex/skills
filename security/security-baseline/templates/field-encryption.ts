import crypto from 'node:crypto';

// Chiffrement de champ AES-256-GCM. Format versionné pour permettre une rotation
// de clé future sans casser l'existant : "v1:<iv_b64>:<tag_b64>:<ciphertext_b64>".
const VERSION = 'v1';
const IV_BYTES = 12; // recommandé pour GCM

export function encryptWith(key: Buffer, plaintext: string): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`;
}

export function decryptWith(key: Buffer, value: string): string {
  const [version, ivB64, tagB64, ctB64] = value.split(':');
  if (version !== VERSION) throw new Error(`Unsupported ciphertext version: ${version}`);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]).toString('utf8');
}

// Défaut basé sur l'env. Lu à chaque appel (fail-closed) : sans clé valide de
// 32 octets, le chiffrement refuse de fonctionner plutôt que de stocker en clair.
function envKey(): Buffer {
  const raw = process.env.PII_ENCRYPTION_KEY;
  if (!raw) throw new Error('PII_ENCRYPTION_KEY manquante');
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('PII_ENCRYPTION_KEY doit faire 32 octets (base64)');
  return key;
}

export function encrypt(plaintext: string): string {
  return encryptWith(envKey(), plaintext);
}

export function decrypt(value: string): string {
  return decryptWith(envKey(), value);
}
