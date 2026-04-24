'use client';

export function DashboardSkeleton() {
  return (
    <div className="w-full">
      {/* Tab bar skeleton */}
      <div className="flex gap-4 mb-6">
        <div className="w-20 h-5 bg-gray-200 animate-pulse rounded" />
        <div className="w-20 h-5 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[10px] p-4 bg-gray-100 animate-pulse"
            style={{ height: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="w-14 h-5 bg-gray-200 rounded-full" />
            </div>

            {/* Circular gauge placeholder */}
            <div className="flex justify-center mb-3">
              <div
                className="rounded-full bg-gray-200"
                style={{ width: 96, height: 96 }}
              />
            </div>

            {/* Text placeholders */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-28 h-3 bg-gray-200 rounded" />
              <div className="w-36 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
