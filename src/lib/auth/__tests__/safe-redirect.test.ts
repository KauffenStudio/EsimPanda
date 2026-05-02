import { describe, it, expect } from 'vitest';
import { safeNext } from '../safe-redirect';

describe('safeNext', () => {
  it('returns the path unchanged when locale-prefixed and well-formed', () => {
    expect(safeNext('/en')).toBe('/en');
    expect(safeNext('/pt')).toBe('/pt');
    expect(safeNext('/pt/dashboard')).toBe('/pt/dashboard');
    expect(safeNext('/es/checkout?cart=abc')).toBe('/es/checkout?cart=abc');
  });

  it('falls back to /en when input is missing or empty', () => {
    expect(safeNext(null)).toBe('/en');
    expect(safeNext(undefined)).toBe('/en');
    expect(safeNext('')).toBe('/en');
    expect(safeNext('/')).toBe('/en');
  });

  it('rejects protocol-relative open redirects', () => {
    expect(safeNext('//evil.com')).toBe('/en');
    expect(safeNext('//evil.com/path')).toBe('/en');
    expect(safeNext('//evil.com?next=/en')).toBe('/en');
  });

  it('rejects backslash-trick variants', () => {
    expect(safeNext('/\\evil.com')).toBe('/en');
    expect(safeNext('/\\\\evil.com')).toBe('/en');
  });

  it('rejects scheme-absolute URLs', () => {
    expect(safeNext('https://evil.com')).toBe('/en');
    expect(safeNext('http://evil.com')).toBe('/en');
    expect(safeNext('javascript:alert(1)')).toBe('/en');
    expect(safeNext('data:text/html,<script>')).toBe('/en');
  });

  it('rejects URLs with a colon right after the first slash', () => {
    expect(safeNext('/javascript:alert(1)')).toBe('/en');
    expect(safeNext('/https://evil.com')).toBe('/en');
  });

  it('rejects paths whose first segment is not a known locale', () => {
    expect(safeNext('/dashboard')).toBe('/en');
    expect(safeNext('/admin')).toBe('/en');
    expect(safeNext('/foo/pt')).toBe('/en');
  });

  it('does not accept paths missing the leading slash', () => {
    expect(safeNext('en')).toBe('/en');
    expect(safeNext('pt/dashboard')).toBe('/en');
  });
});
