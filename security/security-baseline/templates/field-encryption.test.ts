import { describe, it, expect, afterEach } from 'vitest';
import { encryptWith, decryptWith, encrypt, decrypt } from './field-encryption.js';

const KEY = Buffer.alloc(32, 1); // clé de test déterministe (32 octets)

describe('field-encryption', () => {
  it('round-trip : déchiffrer ce qu\'on a chiffré rend la valeur originale', () => {
    const ct = encryptWith(KEY, 'jean.dupont@example.ch');
    expect(decryptWith(KEY, ct)).toBe('jean.dupont@example.ch');
  });

  it('non déterministe : la même valeur chiffrée deux fois donne deux ciphertexts', () => {
    expect(encryptWith(KEY, 'secret')).not.toBe(encryptWith(KEY, 'secret'));
  });

  it('tamper detection : un ciphertext altéré fait échouer le déchiffrement', () => {
    const ct = encryptWith(KEY, 'secret');
    const tampered = ct.slice(0, -4) + (ct.endsWith('A') ? 'B===' : 'A===');
    expect(() => decryptWith(KEY, tampered)).toThrow();
  });

  it('rejette une version de format inconnue', () => {
    expect(() => decryptWith(KEY, 'v9:aa:bb:cc')).toThrow(/version/i);
  });

  describe('défaut basé sur l\'env (PII_ENCRYPTION_KEY)', () => {
    afterEach(() => {
      delete process.env.PII_ENCRYPTION_KEY;
    });

    it('round-trip via la clé d\'env', () => {
      process.env.PII_ENCRYPTION_KEY = Buffer.alloc(32, 2).toString('base64');
      expect(decrypt(encrypt('téléphone'))).toBe('téléphone');
    });

    it('fail-closed : throw si la clé est absente', () => {
      expect(() => encrypt('x')).toThrow();
    });

    it('fail-closed : throw si la clé ne fait pas 32 octets', () => {
      process.env.PII_ENCRYPTION_KEY = Buffer.alloc(16, 2).toString('base64');
      expect(() => encrypt('x')).toThrow();
    });
  });
});
