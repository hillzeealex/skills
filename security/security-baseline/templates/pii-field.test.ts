import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { encryptField, decryptField, isEncrypted, encodeFields, decodeFields } from './pii-field.js';

describe('pii-field (seam null-safe + tolérance transition)', () => {
  beforeEach(() => {
    process.env.PII_ENCRYPTION_KEY = Buffer.alloc(32, 5).toString('base64');
  });
  afterEach(() => {
    delete process.env.PII_ENCRYPTION_KEY;
  });

  it('null/undefined passent sans chiffrer', () => {
    expect(encryptField(null)).toBeNull();
    expect(encryptField(undefined)).toBeNull();
    expect(decryptField(null)).toBeNull();
  });

  it('round-trip d\'une valeur', () => {
    const ct = encryptField('+41 79 123 45 67');
    expect(ct).not.toBe('+41 79 123 45 67');
    expect(decryptField(ct)).toBe('+41 79 123 45 67');
  });

  it('decryptField tolère le legacy en clair (rows pas encore migrés)', () => {
    // Une valeur non préfixée v1: est renvoyée telle quelle pendant la transition.
    expect(decryptField('+41 79 000 00 00')).toBe('+41 79 000 00 00');
  });

  it('encryptField est idempotent : ne re-chiffre pas un déjà-chiffré', () => {
    const once = encryptField('secret');
    expect(encryptField(once)).toBe(once);
  });

  it('isEncrypted distingue ciphertext et clair', () => {
    expect(isEncrypted(encryptField('x'))).toBe(true);
    expect(isEncrypted('clair')).toBe(false);
    expect(isEncrypted(null)).toBe(false);
  });

  it('encodeFields/decodeFields : round-trip sur les champs listés uniquement', () => {
    const enc = encodeFields({ address: 'Rue 1', city: 'Genève', ip: null }, ['address', 'ip']);
    expect(isEncrypted(enc.address)).toBe(true);
    expect(enc.city).toBe('Genève'); // non listé -> intact
    expect(enc.ip).toBeNull();
    const dec = decodeFields(enc, ['address', 'ip']);
    expect(dec.address).toBe('Rue 1');
  });

  it('encodeFields ignore les champs absents (update partiel)', () => {
    const enc = encodeFields({ city: 'Genève' }, ['address']);
    expect(enc).toEqual({ city: 'Genève' });
  });
});
