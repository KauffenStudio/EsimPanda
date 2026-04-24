import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardTabs } from '../dashboard-tabs';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...props}>{children as React.ReactNode}</div>
    ),
  },
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      'dashboard.tab_esims': 'My eSIMs',
      'dashboard.tab_history': 'Purchase History',
    };
    return messages[key] || key;
  },
}));

describe('DashboardTabs', () => {
  it('renders both tab labels "My eSIMs" and "Purchase History"', () => {
    render(<DashboardTabs active_tab="esims" onTabChange={() => {}} />);
    expect(screen.getByText('My eSIMs')).toBeInTheDocument();
    expect(screen.getByText('Purchase History')).toBeInTheDocument();
  });

  it('active tab has aria-selected="true"', () => {
    render(<DashboardTabs active_tab="esims" onTabChange={() => {}} />);
    const esimsTab = screen.getByText('My eSIMs').closest('[role="tab"]');
    const historyTab = screen.getByText('Purchase History').closest('[role="tab"]');
    expect(esimsTab).toHaveAttribute('aria-selected', 'true');
    expect(historyTab).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking inactive tab calls onTabChange with correct tab value', () => {
    const onTabChange = vi.fn();
    render(<DashboardTabs active_tab="esims" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText('Purchase History'));
    expect(onTabChange).toHaveBeenCalledWith('history');
  });
});
