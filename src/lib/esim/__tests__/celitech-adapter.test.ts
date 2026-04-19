/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock celitech-sdk before importing adapter
const mockDestinationsList = vi.fn();
const mockPackagesList = vi.fn();
const mockPurchasesCreate = vi.fn();
const mockPurchasesTopUp = vi.fn();
const mockEsimGetEsim = vi.fn();

vi.mock('celitech-sdk', () => {
  class MockCelitech {
    destinations = { listDestinations: mockDestinationsList };
    packages = { listPackages: mockPackagesList };
    purchases = { createPurchase: mockPurchasesCreate, topUpEsim: mockPurchasesTopUp };
    eSim = { getEsim: mockEsimGetEsim };
    constructor(_opts: any) {}
  }
  return { Celitech: MockCelitech };
});

import { CelitechAdapter } from '../celitech-adapter';
import type { NormalizedDestination, NormalizedPackage, NormalizedPurchase } from '../types';

describe('CelitechAdapter', () => {
  let adapter: CelitechAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new CelitechAdapter();
  });

  describe('listDestinations', () => {
    it('maps CELITECH response to NormalizedDestination[]', async () => {
      mockDestinationsList.mockResolvedValue({
        destinations: [
          { name: 'France', isoCode: 'FR', region: 'Europe' },
          { name: 'Japan', isoCode: 'JP', region: 'Asia' },
        ],
      });

      const result: NormalizedDestination[] = await adapter.listDestinations();

      expect(result).toEqual([
        { name: 'France', iso: 'FR', region: 'Europe' },
        { name: 'Japan', iso: 'JP', region: 'Asia' },
      ]);
    });

    it('defaults region to "unknown" when not provided', async () => {
      mockDestinationsList.mockResolvedValue({
        destinations: [
          { name: 'TestLand', isoCode: 'TL' },
        ],
      });

      const result = await adapter.listDestinations();
      expect(result[0].region).toBe('unknown');
    });
  });

  describe('listPackages', () => {
    it('maps CELITECH response to NormalizedPackage[] with cents conversion', async () => {
      mockPackagesList.mockResolvedValue({
        packages: [
          {
            id: 'pkg-1',
            destination: 'FR',
            dataInGb: 1,
            duration: 7,
            price: 4.5,
            currency: 'USD',
          },
        ],
      });

      const result: NormalizedPackage[] = await adapter.listPackages('FR');

      expect(result).toEqual([
        {
          id: expect.any(String),
          wholesaleId: 'pkg-1',
          destination: 'FR',
          dataGB: 1,
          durationDays: 7,
          wholesalePriceCents: 450,
          currency: 'USD',
        },
      ]);
    });

    it('stores prices as integer cents (not floats)', async () => {
      mockPackagesList.mockResolvedValue({
        packages: [
          { id: 'pkg-2', destination: 'JP', dataInGb: 3, duration: 30, price: 12.99, currency: 'USD' },
        ],
      });

      const result = await adapter.listPackages('JP');
      expect(result[0].wholesalePriceCents).toBe(1299);
      expect(Number.isInteger(result[0].wholesalePriceCents)).toBe(true);
    });
  });

  describe('purchase', () => {
    it('maps CELITECH response to NormalizedPurchase', async () => {
      mockPurchasesCreate.mockResolvedValue({
        purchase: {
          iccid: '8901234567890',
          qrCode: 'base64encodedQR==',
          manualActivationCode: 'LPA:1$example.com$ABCDEF',
          iosActivationLink: 'https://ios.link',
          androidActivationLink: 'https://android.link',
          status: 'active',
        },
      });

      const result: NormalizedPurchase = await adapter.purchase('pkg-1', 1);

      expect(result).toEqual({
        iccid: '8901234567890',
        activationQrBase64: 'base64encodedQR==',
        manualActivationCode: 'LPA:1$example.com$ABCDEF',
        iosActivationLink: 'https://ios.link',
        androidActivationLink: 'https://android.link',
        status: 'active',
      });
    });
  });
});
