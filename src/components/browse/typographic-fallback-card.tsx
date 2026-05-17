'use client';

// Shared typographic image-fallback primitive (CAT-07). Built ONCE — both
// DestinationCard and RegionalPlanCard consume it for their null-image_url path.
// A self-contained branded surface: bold destination name on the brand gradient
// (#2979FF top-left -> #18181B bottom-right, 135deg). Same gradient in light and
// dark mode — it does not invert. No <img>, no flag, no placeholder graphic.

export function TypographicFallbackCard({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-3 bg-gradient-to-br from-accent to-primary">
      <span className="text-white text-lg md:text-xl font-bold tracking-tight text-center line-clamp-2">
        {name}
      </span>
    </div>
  );
}
