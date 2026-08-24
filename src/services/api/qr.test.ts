import { describe, it, expect } from 'vitest';
import { decodeQrPayload } from './qr';

describe('services/qr', () => {
  it('decodifica un payload JSON válido', () => {
    const raw = JSON.stringify({ numeroDocumento: '123456', nombreCompleto: 'Ana Pérez' });
    expect(decodeQrPayload(raw)).toEqual({ numeroDocumento: '123456', nombreCompleto: 'Ana Pérez' });
  });

  it('devuelve null si el texto no es JSON', () => {
    expect(decodeQrPayload('esto no es json')).toBeNull();
  });

  it('devuelve null si el JSON es un valor primitivo, no un objeto', () => {
    expect(decodeQrPayload('"solo un string"')).toBeNull();
    expect(decodeQrPayload('42')).toBeNull();
  });
});
