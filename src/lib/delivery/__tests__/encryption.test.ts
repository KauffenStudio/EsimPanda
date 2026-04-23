import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../encryption';

describe('encryption', () => {
  it('produces iv:authTag:ciphertext format (3 colon-separated hex segments)', () => {
    const result = encrypt('hello world');
    const parts = result.split(':');
    expect(parts).toHaveLength(3);
    // Each part should be a valid hex string
    parts.forEach((part) => {
      expect(part).toMatch(/^[0-9a-f]+$/);
    });
  });

  it('round-trip: decrypt(encrypt(text)) === text', () => {
    const plaintext = 'hello world';
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('round-trip works with JSON data', () => {
    const data = JSON.stringify({
      activation_code: 'K2-ABC123-DEF456',
      smdp_address: 'smdp.example.com',
      qr_base64: 'iVBORw0KGgo=',
    });
    const encrypted = encrypt(data);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(data);
  });

  it('produces different output each call (random IV)', () => {
    const plaintext = 'same input';
    const result1 = encrypt(plaintext);
    const result2 = encrypt(plaintext);
    expect(result1).not.toBe(result2);
  });

  it('throws on decrypt with tampered ciphertext', () => {
    const encrypted = encrypt('test data');
    const parts = encrypted.split(':');
    // Tamper with the ciphertext (last part)
    const tampered = parts[0] + ':' + parts[1] + ':' + 'ff'.repeat(parts[2].length / 2);
    expect(() => decrypt(tampered)).toThrow();
  });
});
