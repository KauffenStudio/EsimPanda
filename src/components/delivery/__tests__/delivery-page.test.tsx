import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { DeliveryPage } from '../delivery-page';
import { useDeliveryStore } from '@/stores/delivery';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (params) {
      let result = key;
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, v);
      }
      return result;
    }
    return key;
  },
}));

// Mock motion/react to avoid animation complexity
vi.mock('motion/react', () => {
  const React = require('react');
  const createMotionComponent = (tag: string) => {
    return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        whileTap: _whileTap,
        ...rest
      } = props;
      return React.createElement(tag, { ...rest, ref });
    });
  };

  return {
    motion: new Proxy(
      {},
      {
        get: (_target: object, prop: string) => createMotionComponent(prop),
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock qrcode.react
vi.mock('qrcode.react', () => ({
  QRCodeSVG: (props: { value: string }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'qr-code', 'data-value': props.value });
  },
}));

const mockDeliveryData = {
  iccid: 'TEST-ICCID-1234',
  activation_qr_base64: 'base64-test-data',
  manual_activation_code: 'TEST-ACT-CODE',
  smdp_address: 'smdp.test.com',
  ios_activation_link: 'https://esim.test/ios',
  android_activation_link: 'https://esim.test/android',
};

describe('DeliveryPage', () => {
  beforeEach(() => {
    useDeliveryStore.getState().reset();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'provisioning' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders provisioning state initially', async () => {
    await act(async () => {
      render(<DeliveryPage paymentIntentId="pi_test_123" />);
    });

    expect(screen.getByText('provisioning.message1')).toBeDefined();
  });

  it('transitions to ready state when store status becomes ready', async () => {
    await act(async () => {
      render(<DeliveryPage paymentIntentId="pi_test_123" email="test@test.com" />);
    });

    // Simulate the store receiving ready status (as polling would set it)
    await act(async () => {
      useDeliveryStore.getState().setData(mockDeliveryData, 'ORD-TEST1234');
    });

    await waitFor(() => {
      expect(screen.getByText('ready.heading')).toBeDefined();
    });
  });

  it('shows error state when store status becomes failed', async () => {
    await act(async () => {
      render(<DeliveryPage paymentIntentId="pi_test_123" />);
    });

    // Simulate the store receiving failed status (as polling would set it)
    await act(async () => {
      useDeliveryStore.getState().setError('test error', 3);
    });

    await waitFor(() => {
      expect(screen.getByText('error.final')).toBeDefined();
    });
  });
});
