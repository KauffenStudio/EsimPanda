import { describe, it, expect, beforeEach } from 'vitest';
import { useComparisonStore } from '../comparison';

describe('useComparisonStore', () => {
  beforeEach(() => {
    useComparisonStore.setState({ selectedPlanIds: [], isSheetOpen: false });
  });

  it('togglePlan adds a plan to selection', () => {
    useComparisonStore.getState().togglePlan('plan-1');
    expect(useComparisonStore.getState().selectedPlanIds).toEqual(['plan-1']);
  });

  it('togglePlan removes a plan if already selected', () => {
    useComparisonStore.setState({ selectedPlanIds: ['plan-1'] });
    useComparisonStore.getState().togglePlan('plan-1');
    expect(useComparisonStore.getState().selectedPlanIds).toEqual([]);
  });

  it('cannot exceed 3 selected plans', () => {
    useComparisonStore.setState({ selectedPlanIds: ['p1', 'p2', 'p3'] });
    useComparisonStore.getState().togglePlan('p4');
    expect(useComparisonStore.getState().selectedPlanIds).toHaveLength(3);
    expect(useComparisonStore.getState().selectedPlanIds).not.toContain('p4');
  });

  it('clearSelection empties array and closes sheet', () => {
    useComparisonStore.setState({ selectedPlanIds: ['p1', 'p2'], isSheetOpen: true });
    useComparisonStore.getState().clearSelection();
    expect(useComparisonStore.getState().selectedPlanIds).toEqual([]);
    expect(useComparisonStore.getState().isSheetOpen).toBe(false);
  });

  it('openSheet and closeSheet toggle isSheetOpen', () => {
    useComparisonStore.getState().openSheet();
    expect(useComparisonStore.getState().isSheetOpen).toBe(true);
    useComparisonStore.getState().closeSheet();
    expect(useComparisonStore.getState().isSheetOpen).toBe(false);
  });
});
