import { describe, it, expect, afterEach } from 'vitest';
import { blindIndexWith, blindIndex } from './blind-index.js';

const PEPPER = Buffer.alloc(32, 9);

describe('blind-index', () => {
  it('déterministe : la même valeur donne le même index', () => {
    expect(blindIndexWith(PEPPER, 'a@b.ch')).toBe(blindIndexWith(PEPPER, 'a@b.ch'));
  });

  it('des valeurs différentes donnent des index différents', () => {
    expect(blindIndexWith(PEPPER, 'a@b.ch')).not.toBe(blindIndexWith(PEPPER, 'c@d.ch'));
  });

  it('normalise la casse et les espaces (matche au login)', () => {
    expect(blindIndexWith(PEPPER, '  A@B.CH ')).toBe(blindIndexWith(PEPPER, 'a@b.ch'));
  });

  it('le pepper change l\'index (pas un simple SHA public)', () => {
    expect(blindIndexWith(PEPPER, 'a@b.ch')).not.toBe(blindIndexWith(Buffer.alloc(32, 1), 'a@b.ch'));
  });

  describe('défaut basé sur l\'env (PII_BLIND_INDEX_PEPPER)', () => {
    afterEach(() => {
      delete process.env.PII_BLIND_INDEX_PEPPER;
    });

    it('round-trip via le pepper d\'env', () => {
      process.env.PII_BLIND_INDEX_PEPPER = Buffer.alloc(32, 3).toString('base64');
      expect(blindIndex('a@b.ch')).toBe(blindIndex('A@B.ch'));
    });

    it('fail-closed : throw si le pepper est absent', () => {
      expect(() => blindIndex('a@b.ch')).toThrow();
    });
  });
});
