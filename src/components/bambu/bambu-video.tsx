'use client';

import { useRef, useEffect, useState } from 'react';

type BambuVariant = 'splash' | 'loading' | 'hero-panda';

interface BambuVideoProps {
  variant: BambuVariant;
  size?: number;
  className?: string;
  loop?: boolean;
  raw?: boolean;
  /**
   * Optional still shown instantly while the (heavier) video downloads.
   * Improves perceived load on the hero, where the clip is a few MB.
   */
  poster?: string;
  onEnded?: () => void;
}

// Only variants whose asset actually ships. Seven more (success, error, empty,
// browse, preparing, welcome, hero-intro) used to live here pointing at files
// that were never added — every one 404'd and silently rendered nothing across
// 18 call sites. Re-add a variant only together with its clip.
const videoMap: Record<BambuVariant, string> = {
  splash: '/bambu/panda-splash.mp4',
  loading: '/bambu/loading.mp4',
  'hero-panda': '/bambu/panda-front.mp4',
};

const hasAlpha = (v: BambuVariant) => videoMap[v].endsWith('.webm');

export function BambuVideo({
  variant,
  size = 120,
  className = '',
  loop = true,
  raw = false,
  poster,
  onEnded,
}: BambuVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Some mascot clips are mid-migration and may 404. Rather than show a blank
  // box (and a noisy console error), hide the element if its source fails.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Eagerly try to play on mount (mobile needs this). HTMLMediaElement.play()
    // returns a Promise in real browsers but jsdom (and very old engines)
    // can return undefined — guard before chaining .catch.
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }

    // Skip observer for raw mode — raw videos manage their own visibility
    if (raw) return;

    // jsdom and very old browsers don't ship IntersectionObserver. Skip
    // visibility-based playback in those environments — the eager play
    // above is enough to keep tests passing without crashing.
    if (typeof IntersectionObserver === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(video);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [raw]);

  // Source unavailable — render nothing so the surrounding layout stays clean.
  if (failed) return null;

  if (raw) {
    return (
      <video
        ref={videoRef}
        src={videoMap[variant]}
        loop={loop}
        muted
        playsInline
        autoPlay
        poster={poster}
        preload={poster ? 'metadata' : 'auto'}
        onEnded={onEnded}
        onError={() => setFailed(true)}
        className={`object-contain ${hasAlpha(variant) ? '' : 'mix-blend-multiply dark:mix-blend-screen'} ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <video
        ref={videoRef}
        src={videoMap[variant]}
        width={size}
        height={size}
        loop={loop}
        muted
        playsInline
        preload={variant === 'splash' ? 'auto' : 'metadata'}
        onEnded={onEnded}
        onError={() => setFailed(true)}
        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen"
      />
    </div>
  );
}
