import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PurchaseHistoryRow } from '../purchase-history-row';
import type { PurchaseRecord } from '@/lib/dashboard/types';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const safe = { ...props };
      for (const k of ['initial', 'animate', 'exit', 'transition', 'layout', 'whileHover', 'whileTap', 'variants']) {
        delete safe[k];
      }
      return <div {...safe}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const messages: Record<string, string> = {
      'dashboard.history_order_id': 'Order',
      'dashboard.history_plan': 'Plan',
      'dashboard.history_payment': 'Payment',
      'dashboard.history_coupon': `Coupon: ${params?.code || ''} (-${params?.discount || ''}%)`,
      'dashboard.history_subtotal': 'Subtotal',
      'dashboard.history_vat': `VAT (${params?.rate || ''}%)`,
      'dashboard.history_total': 'Total',
      'dashboard.history_iccid': 'ICCID',
      'dashboard.view_qr': 'View QR Code',
      'dashboard.resend_email': 'Re-send Email',
    };
    return messages[key] || key;
  },
}));

// Mock QrCodeDisplay
vi.mock('@/components/delivery/qr-code-display', () => ({
  QrCodeDisplay: ({ data }: { data: string }) => <div data-testid="qr-code-display">{data}</div>,
}));

// Mock Lucide
vi.mock('lucide-react', () => ({
  ChevronDown: (props: Record<string, unknown>) => (
    <svg data-testid="chevron-icon" className={String(props.className || '')} />
  ),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock resendDeliveryEmail
vi.mock('@/lib/dashboard/actions', () => ({
  resendDeliveryEmail: vi.fn().mockResolvedValue({ success: true }),
}));

const mockPurchaseWithCoupon: PurchaseRecord = {
  id: 'pur-001',
  order_id: 'ord-005',
  date: '2026-04-24T09:00:00Z',
  destination: 'Italy',
  destination_iso: 'IT',
  plan_name: 'Italy 10GB / 30 days',
  duration_days: 30,
  data_gb: 10,
  amount_paid_cents: 2460,
  currency: 'EUR',
  payment_method: 'Visa *4242',
  coupon_code: 'WELCOME10',
  discount_cents: 200,
  tax_cents: 460,
  subtotal_cents: 2000,
  iccid: '8935101000000000005',
  status: 'completed',
};

const mockPurchaseNoCoupon: PurchaseRecord = {
  id: 'pur-002',
  order_id: 'ord-003',
  date: '2026-04-14T09:00:00Z',
  destination: 'France',
  destination_iso: 'FR',
  plan_name: 'France 2GB / 7 days',
  duration_days: 7,
  data_gb: 2,
  amount_paid_cents: 984,
  currency: 'EUR',
  payment_method: 'Mastercard *5555',
  coupon_code: null,
  discount_cents: 0,
  tax_cents: 184,
  subtotal_cents: 800,
  iccid: '8935101000000000003',
  status: 'completed',
};

const mockOnResend = vi.fn();

describe('PurchaseHistoryRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders date, destination, and amount in collapsed state', () => {
    render(<PurchaseHistoryRow purchase={mockPurchaseWithCoupon} onResendEmail={mockOnResend} />);
    expect(screen.getByText(/Italy/)).toBeTruthy();
    expect(screen.getByText('EUR 24.60')).toBeTruthy();
  });

  it('clicking row toggles expanded state (aria-expanded changes)', () => {
    render(<PurchaseHistoryRow purchase={mockPurchaseWithCoupon} onResendEmail={mockOnResend} />);
    const trigger = screen.getByRole('button', { name: /Italy/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('expanded state shows order ID, plan name, payment method, ICCID', () => {
    render(<PurchaseHistoryRow purchase={mockPurchaseWithCoupon} onResendEmail={mockOnResend} />);
    const trigger = screen.getByRole('button', { name: /Italy/i });
    fireEvent.click(trigger);
    expect(screen.getByText(/ORD-ord-005/)).toBeTruthy();
    expect(screen.getByText('Italy 10GB / 30 days')).toBeTruthy();
    expect(screen.getByText('Visa *4242')).toBeTruthy();
    expect(screen.getByText('8935101000000000005')).toBeTruthy();
  });

  it('expanded state shows View QR Code and Re-send Email buttons', () => {
    render(<PurchaseHistoryRow purchase={mockPurchaseWithCoupon} onResendEmail={mockOnResend} />);
    const trigger = screen.getByRole('button', { name: /Italy/i });
    fireEvent.click(trigger);
    expect(screen.getByText('View QR Code')).toBeTruthy();
    expect(screen.getByText('Re-send Email')).toBeTruthy();
  });

  it('chevron icon rotates 180deg when expanded (has rotate-180 class)', () => {
    render(<PurchaseHistoryRow purchase={mockPurchaseWithCoupon} onResendEmail={mockOnResend} />);
    const chevron = screen.getByTestId('chevron-icon');
    expect(chevron.getAttribute('class') || '').not.toContain('rotate-180');
    const trigger = screen.getByRole('button', { name: /Italy/i });
    fireEvent.click(trigger);
    const chevronAfter = screen.getByTestId('chevron-icon');
    expect(chevronAfter.getAttribute('class')).toContain('rotate-180');
  });

  it('shows coupon info only when coupon_code is not null', () => {
    const { rerender } = render(
      <PurchaseHistoryRow purchase={mockPurchaseWithCoupon} onResendEmail={mockOnResend} />
    );
    const trigger1 = screen.getByRole('button', { name: /Italy/i });
    fireEvent.click(trigger1);
    expect(screen.getByText('WELCOME10')).toBeTruthy();

    rerender(
      <PurchaseHistoryRow purchase={mockPurchaseNoCoupon} onResendEmail={mockOnResend} />
    );
    const trigger2 = screen.getByRole('button', { name: /France/i });
    fireEvent.click(trigger2);
    expect(screen.queryByText(/WELCOME10/)).toBeNull();
  });
});
