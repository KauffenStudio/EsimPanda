import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useDeviceCompatStore, getBrands, getModelsForBrand } from '../use-device-compat';

describe('Device Compatibility Store', () => {
  beforeEach(() => {
    act(() => {
      useDeviceCompatStore.getState().reset();
    });
  });

  it('getBrands returns all brand names from device list', () => {
    const brands = getBrands();
    expect(brands).toContain('Apple');
    expect(brands).toContain('Samsung');
    expect(brands).toContain('Google');
    expect(brands).toContain('Motorola');
    expect(brands).toContain('OnePlus');
    expect(brands).toContain('Xiaomi');
    expect(brands.length).toBe(6);
  });

  it('getModelsForBrand returns correct models for Apple', () => {
    const models = getModelsForBrand('Apple');
    expect(models).toContain('iPhone 15 Pro');
    expect(models).toContain('iPhone XS');
    expect(models.length).toBeGreaterThan(10);
  });

  it('getModelsForBrand returns empty array for unknown brand', () => {
    const models = getModelsForBrand('UnknownBrand');
    expect(models).toEqual([]);
  });

  it('checkCompatibility returns true for compatible device (iPhone 15 Pro)', () => {
    act(() => {
      useDeviceCompatStore.getState().setBrand('Apple');
    });
    act(() => {
      useDeviceCompatStore.getState().setModel('iPhone 15 Pro');
    });
    act(() => {
      useDeviceCompatStore.getState().checkCompatibility();
    });
    expect(useDeviceCompatStore.getState().isCompatible).toBe(true);
  });

  it('checkCompatibility returns false for incompatible device (iPhone 8)', () => {
    act(() => {
      useDeviceCompatStore.getState().setBrand('Apple');
    });
    act(() => {
      useDeviceCompatStore.getState().setModel('iPhone 8');
    });
    act(() => {
      useDeviceCompatStore.getState().checkCompatibility();
    });
    expect(useDeviceCompatStore.getState().isCompatible).toBe(false);
  });

  it('checkCompatibility returns true for Samsung Galaxy S24', () => {
    act(() => {
      useDeviceCompatStore.getState().setBrand('Samsung');
    });
    act(() => {
      useDeviceCompatStore.getState().setModel('Galaxy S24');
    });
    act(() => {
      useDeviceCompatStore.getState().checkCompatibility();
    });
    expect(useDeviceCompatStore.getState().isCompatible).toBe(true);
  });

  it('checkCompatibility returns false for Huawei P30 Lite', () => {
    act(() => {
      useDeviceCompatStore.getState().setBrand('Huawei');
    });
    act(() => {
      useDeviceCompatStore.getState().setModel('P30 Lite');
    });
    act(() => {
      useDeviceCompatStore.getState().checkCompatibility();
    });
    expect(useDeviceCompatStore.getState().isCompatible).toBe(false);
  });

  it('setBrand resets model and isCompatible to null', () => {
    act(() => {
      useDeviceCompatStore.getState().setBrand('Apple');
    });
    act(() => {
      useDeviceCompatStore.getState().setModel('iPhone 15 Pro');
    });
    act(() => {
      useDeviceCompatStore.getState().checkCompatibility();
    });
    expect(useDeviceCompatStore.getState().isCompatible).toBe(true);

    act(() => {
      useDeviceCompatStore.getState().setBrand('Samsung');
    });
    expect(useDeviceCompatStore.getState().model).toBeNull();
    expect(useDeviceCompatStore.getState().isCompatible).toBeNull();
  });
});
