import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopUpModal } from '../top-up-modal';
import type { DashboardEsim } from '@/lib/dashboard/types';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const safe = { ...props };
      // Strip motion-specific props
      for (const k of ['initial', 'animate', 'exit', 'transition', 'layout', 'whileHover', 'whileTap', 'variants']) {
        delete safe[k];
      }
      return <div {...safe}>{children as React.ReactNode}</div>;
    },
    button: ({ children, ...props }: Record<string, unknown>) => {
      const safe = { ...props };
      for (const k of ['initial', 'animate', 'exit', 'transition', 'layout', 'whileHover', 'whileTap', 'variants']) {
        delete safe[k];
      }
      return <button {...safe}>{children as React.ReactNode}</button>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const messages: Record<string, string> = {
      'dashboard.top_up_title': `Top Up ${params?.destination || ''}`,
      'dashboard.top_up_reactivate_note': 'Topping up will reactivate this eSIM',
      'dashboard.top_up_pay': `Pay EUR ${params?.amount || ''}`,
      'dashboard.top_up_processing': 'Processing your top-up...',
      'dashboard.data_added': 'Data added!',
      'dashboard.top_up_error': 'Something went wrong',
      'dashboard.top_up_try_again': 'Try Again',
      'dashboard.top_up_success_toast': `Data added to your ${params?.destination || ''} eSIM!`,
    };
    return messages[key] || key;
  },
}));

// Mock Stripe
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element" />,
  ExpressCheckoutElement: () => <div data-testid="express-checkout-element" />,
}));

// Mock Bambu video component
vi.mock('@/components/bambu/bambu-video', () => ({
  BambuVideo: ({ variant }: { variant: string }) => <div data-testid={`bambu-${variant}`} />,
}));

// Mock Stripe client
vi.mock('@/lib/stripe/client', () => ({
  getStripe: () => null,
  STRIPE_MOCK_MODE: true,
}));

// Mock Lucide
vi.mock('lucide-react', () => ({
  X: ({ ...props }: Record<string, unknown>) => <svg data-testid="x-icon" {...props} />,
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockCloseTopUp = vi.fn();
const mockSetTopUpStatus = vi.fn();

const mockActiveEsim: DashboardEsim = {
  id: 'esim-001',
  iccid: '8935101000000000001',
  destination: 'Portugal',
  destination_iso: 'PT',
  status: 'active',
  data_total_gb: 5,
  data_used_gb: 1.2,
  data_remaining_gb: 3.8,
  data_remaining_pct: 76,
  expires_at: '2026-05-15T00:00:00Z',
  activated_at: '2026-04-15T10:30:00Z',
  last_usage_check: '2026-04-24T08:00:00Z',
  plan_name: 'Portugal 5GB / 30 days',
  order_id: 'ord-001',
  wholesale_plan_id: 'wh-pt-5gb',
};

const mockExpiredEsim: DashboardEsim = {
  ...mockActiveEsim,
  id: 'esim-004',
  destination: 'Germany',
  destination_iso: 'DE',
  status: 'expired',
  data_remaining_gb: 0,
  data_remaining_pct: 0,
};

// Store mock state
let storeState: Record<string, unknown> = {};

vi.mock('@/stores/dashboard', () => ({
  useDashboardStore: (selector: (state: Record<string, unknown>) => unknown) => selector(storeState),
}));

describe('TopUpModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeState = {
      top_up_esim: mockActiveEsim,
      top_up_status: 'plan-select',
      closeTopUp: mockCloseTopUp,
      setTopUpStatus: mockSetTopUpStatus,
      setEsims: vi.fn(),
      esims: [mockActiveEsim],
    };
  });

  it('renders modal with destination name in title when top_up_esim is set', () => {
    render(<TopUpModal />);
    expect(screen.getByText(/Top Up Portugal/)).toBeTruthy();
  });

  it('renders top-up plan cards in plan-select state', () => {
    render(<TopUpModal />);
    expect(screen.getByText('1GB / 7 days')).toBeTruthy();
    expect(screen.getByText('3GB / 15 days')).toBeTruthy();
    expect(screen.getByText('5GB / 30 days')).toBeTruthy();
  });

  it('clicking a plan card updates top_up_status to payment', () => {
    render(<TopUpModal />);
    fireEvent.click(screen.getByText('1GB / 7 days'));
    expect(mockSetTopUpStatus).toHaveBeenCalledWith('payment');
  });

  it('calls closeTopUp when X button is clicked', () => {
    render(<TopUpModal />);
    const closeBtn = screen.getByTestId('x-icon').closest('button');
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);
    expect(mockCloseTopUp).toHaveBeenCalled();
  });

  it('calls closeTopUp when Escape key is pressed', () => {
    render(<TopUpModal />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockCloseTopUp).toHaveBeenCalled();
  });

  it('renders reactivation note when eSIM status is expired', () => {
    storeState = { ...storeState, top_up_esim: mockExpiredEsim };
    render(<TopUpModal />);
    expect(screen.getByText('Topping up will reactivate this eSIM')).toBeTruthy();
  });

  it('does not render when top_up_esim is null', () => {
    storeState = { ...storeState, top_up_esim: null };
    const { container } = render(<TopUpModal />);
    expect(container.innerHTML).toBe('');
  });
});
