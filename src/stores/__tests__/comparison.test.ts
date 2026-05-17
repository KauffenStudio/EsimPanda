import { describe, it, expect, beforeEach } from 'vitest';
import type { Plan } from '@/lib/db/destinations';
import { fixturePlans } from '@/lib/__test-fixtures__/catalog';
import { useComparisonStore } from '../comparison';

// fixturePlans carries 3 plans; the cap-at-3 test needs a 4th distinct plan.
const planA = fixturePlans[0];
const planB = fixturePlans[1];
const planC = fixturePlans[2];
const planD: Plan = {
  id: 'plan-japan-2gb',
  destination_id: 'dest-japan',
  wholesale_plan_id: 'cel_japan_1',
  provider: 'celitech',
  name: 'Japan 2GB 15 Days',
  data_gb: 2,
  duration_days: 15,
  wholesale_price_cents: 400,
  retail_price_cents: 599,
  currency: 'USD',
  is_active: true,
};

describe('useComparisonStore', () => {
  beforeEach(() => {
    useComparisonStore.setState({ selectedPlans: [], isSheetOpen: false });
  });

  it('initial state — selectedPlans is empty and isSheetOpen is false', () => {
    expect(useComparisonStore.getState().selectedPlans).toEqual([]);
    expect(useComparisonStore.getState().isSheetOpen).toBe(false);
  });

  it('togglePlan adds the full Plan object to selection', () => {
    useComparisonStore.getState().togglePlan(planA);
    const { selectedPlans } = useComparisonStore.getState();
    expect(selectedPlans).toHaveLength(1);
    expect(selectedPlans[0].id).toBe(planA.id);
    expect(selectedPlans[0]).toEqual(planA);
  });

  it('togglePlan twice removes the plan from selection', () => {
    useComparisonStore.getState().togglePlan(planA);
    useComparisonStore.getState().togglePlan(planA);
    expect(useComparisonStore.getState().selectedPlans).toEqual([]);
  });

  it('cannot exceed 3 selected plans — adding a 4th is a no-op', () => {
    const store = useComparisonStore.getState();
    store.togglePlan(planA);
    store.togglePlan(planB);
    store.togglePlan(planC);
    store.togglePlan(planD);
    const { selectedPlans } = useComparisonStore.getState();
    expect(selectedPlans).toHaveLength(3);
    expect(selectedPlans.some((p) => p.id === planD.id)).toBe(false);
  });

  it('clearSelection empties selectedPlans and closes the sheet', () => {
    useComparisonStore.setState({
      selectedPlans: [planA, planB],
      isSheetOpen: true,
    });
    useComparisonStore.getState().clearSelection();
    expect(useComparisonStore.getState().selectedPlans).toEqual([]);
    expect(useComparisonStore.getState().isSheetOpen).toBe(false);
  });

  it('openSheet and closeSheet toggle isSheetOpen', () => {
    useComparisonStore.getState().openSheet();
    expect(useComparisonStore.getState().isSheetOpen).toBe(true);
    useComparisonStore.getState().closeSheet();
    expect(useComparisonStore.getState().isSheetOpen).toBe(false);
  });
});
