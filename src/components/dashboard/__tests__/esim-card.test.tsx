import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EsimCard } from '../esim-card';
import type { DashboardEsim } from '@/lib/dashboard/types';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...props}>{children as React.ReactNode}</div>
    ),
    circle: (props: Record<string, unknown>) => {
      const { children, ...rest } = props;
      return <circle {...rest}>{children as React.ReactNode}</circle>;
    },
    button: ({ children, ...props }: Record<string, unknown>) => (
      <button {...props}>{children as React.ReactNode}</button>
    ),
  },
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const messages: Record<string, string> = {
      'dashboard.status_active': 'Active',
      'dashboard.status_expired': 'Expired',
      'dashboard.status_pending': 'Pending',
      'dashboard.top_up': 'Top Up',
      'dashboard.expires': `Expires: ${params?.date || ''}`,
      'dashboard.data_used': `${params?.used || ''} GB of ${params?.total || ''} GB used`,
      'dashboard.gb_left': 'GB left',
      'dashboard.top_up_reactivate_note': 'Topping up will reactivate this eSIM',
    };
    return messages[key] || key;
  },
}));

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
  data_used_gb: 5,
  data_remaining_gb: 0,
  data_remaining_pct: 0,
};

describe('EsimCard', () => {
  it('renders destination name, status badge, and "Top Up" button', () => {
    render(<EsimCard esim={mockActiveEsim} onTopUp={() => {}} />);
    expect(screen.getByText('Portugal')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Top Up')).toBeInTheDocument();
  });

  it('renders CircularGauge component', () => {
    const { container } = render(
      <EsimCard esim={mockActiveEsim} onTopUp={() => {}} />
    );
    // CircularGauge renders an SVG with role="progressbar"
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it('active status badge has green color classes', () => {
    render(<EsimCard esim={mockActiveEsim} onTopUp={() => {}} />);
    const badge = screen.getByText('Active');
    expect(badge.style.color).toMatch(/(#43A047|rgb\(67,\s*160,\s*71\))/);
  });

  it('expired status badge has gray color classes', () => {
    render(<EsimCard esim={mockExpiredEsim} onTopUp={() => {}} />);
    // "Expired" appears in both badge and gauge — find the badge by its pill styling
    const badges = screen.getAllByText('Expired');
    const badge = badges.find((el) => el.classList.contains('rounded-full'));
    expect(badge).toBeDefined();
    expect(badge!.style.color).toMatch(/(#616161|rgb\(97,\s*97,\s*97\))/);
  });

  it('calls onTopUp callback when "Top Up" button is clicked', () => {
    const onTopUp = vi.fn();
    render(<EsimCard esim={mockActiveEsim} onTopUp={onTopUp} />);
    fireEvent.click(screen.getByText('Top Up'));
    expect(onTopUp).toHaveBeenCalledWith(mockActiveEsim);
  });
});
