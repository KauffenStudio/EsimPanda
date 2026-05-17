// Next route-level loading UI — shown while the async browse RSC awaits
// getCatalog() (and during ISR misses). Matches the populated page layout
// exactly so there is no layout shift when real data lands (UXD-05).
import { DestinationGridSkeleton } from '@/components/browse/destination-card-skeleton';

export default function BrowseLoading() {
  return (
    <div className="px-4 pt-6 pb-20 max-w-[1200px] mx-auto">
      {/* Title placeholder */}
      <div className="h-10 w-48 mb-6 rounded animate-[pulse_1.5s_ease-in-out_infinite] bg-gray-200 dark:bg-gray-700" />
      <DestinationGridSkeleton count={12} />
    </div>
  );
}
