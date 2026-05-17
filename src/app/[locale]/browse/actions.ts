'use server';

// Retry handler for the browse error state (UXD-06). The error banner's Retry
// button calls this server action to re-run the full getCatalog() fetch —
// CONTEXT-locked to NOT use router.refresh(). getCatalog is idempotent, so
// Retry is safe to press repeatedly.
import { getCatalog } from '@/lib/db/destinations';

export async function refetchCatalogAction() {
  return getCatalog();
}
