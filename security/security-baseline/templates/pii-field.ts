import { encrypt, decrypt } from './field-encryption.js';

// Helpers de seam pour les repositories : null-safe, idempotents, et tolérants
// au legacy en clair pendant la migration (une valeur non préfixée "v1:" est
// considérée non chiffrée). Permet de déployer le code avant d'avoir migré les
// données, sans casser les lectures.

const PREFIX = 'v1:';

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

/** Chiffre une valeur pour le stockage. null/undefined -> null. Idempotent. */
export function encryptField(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (isEncrypted(value)) return value;
  return encrypt(value);
}

/** Déchiffre une valeur lue. null -> null. Legacy clair renvoyé tel quel. */
export function decryptField(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (!isEncrypted(value)) return value;
  return decrypt(value);
}

/** Chiffre les champs PII listés d'un objet d'écriture (seulement ceux présents). */
export function encodeFields<T extends Record<string, unknown>>(
  input: T,
  fields: readonly string[],
): T {
  const out: Record<string, unknown> = { ...input };
  for (const f of fields) {
    if (f in out) out[f] = encryptField(out[f] as string | null | undefined);
  }
  return out as T;
}

/** Déchiffre les champs PII listés d'une ligne lue. */
export function decodeFields<T extends Record<string, unknown>>(
  row: T,
  fields: readonly string[],
): T {
  const out: Record<string, unknown> = { ...row };
  for (const f of fields) {
    out[f] = decryptField(out[f] as string | null | undefined);
  }
  return out as T;
}
