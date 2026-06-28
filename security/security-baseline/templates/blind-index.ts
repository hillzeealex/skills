import crypto from 'node:crypto';

// Blind index : HMAC-SHA256(valeur normalisée, pepper). Déterministe et indexable
// (permet un lookup d'égalité, ex. login par email) sans stocker la valeur en
// clair. Le pepper (secret hors DB) empêche un attaquant de pré-calculer des
// hash : ce n'est pas un SHA public.

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function blindIndexWith(pepper: Buffer, value: string): string {
  return crypto.createHmac('sha256', pepper).update(normalize(value), 'utf8').digest('hex');
}

function envPepper(): Buffer {
  const raw = process.env.PII_BLIND_INDEX_PEPPER;
  if (!raw) throw new Error('PII_BLIND_INDEX_PEPPER manquant');
  const pepper = Buffer.from(raw, 'base64');
  if (pepper.length < 16) throw new Error('PII_BLIND_INDEX_PEPPER trop court (>= 16 octets)');
  return pepper;
}

export function blindIndex(value: string): string {
  return blindIndexWith(envPepper(), value);
}
