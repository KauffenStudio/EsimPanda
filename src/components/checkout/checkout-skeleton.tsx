'use client';

export function CheckoutSkeleton() {
  const pulseClass = 'animate-[pulse_1.5s_ease-in-out_infinite] bg-gray-200 dark:bg-gray-700 rounded-xl';

  return (
    <div className="flex flex-col gap-4 w-full max-w-[480px] mx-auto px-4">
      {/* Order summary skeleton */}
      <div className={`${pulseClass} h-40 w-full`} />

      {/* Email field skeleton */}
      <div className="flex flex-col gap-1">
        <div className={`${pulseClass} h-4 w-24`} />
        <div className={`${pulseClass} h-11 w-full`} />
      </div>

      {/* Device check skeleton */}
      <div className={`${pulseClass} h-12 w-full`} />

      {/* Express checkout skeleton */}
      <div className={`${pulseClass} h-12 w-full`} />

      {/* Divider skeleton */}
      <div className={`${pulseClass} h-4 w-40 mx-auto`} />

      {/* Card form skeleton */}
      <div className={`${pulseClass} h-32 w-full`} />

      {/* Pay button skeleton */}
      <div className={`${pulseClass} h-12 w-full mt-2`} />
    </div>
  );
}
