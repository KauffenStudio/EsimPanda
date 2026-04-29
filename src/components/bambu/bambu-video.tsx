'use client';

import { useRef, useEffect } from 'react';

type BambuVariant = 'splash' | 'loading' | 'success' | 'error' | 'empty' | 'browse' | 'preparing' | 'welcome' | 'hero-intro' | 'hero-panda';

interface BambuVideoProps {
  variant: BambuVariant;
  size?: number;
  className?: string;
  loop?: boolean;
  raw?: boolean;
  onEnded?: () => void;
}

const videoMap: Record<BambuVariant, string> = {
  splash: '/bambu/panda-splash.mp4',
  loading: '/bambu/loading.mp4',
  success: '/bambu/success.mp4',
  error: '/bambu/error.mp4',
  empty: '/bambu/empty.mp4',
  browse: '/bambu/browse.mp4',
  preparing: '/bambu/preparing.mp4',
  welcome: '/bambu/welcome.mp4',
  'hero-intro': '/bambu/hero-intro.webm',
  'hero-panda': '/bambu/panda-front.mp4',
};

const hasAlpha = (v: BambuVariant) => videoMap[v].endsWith('.webm');

export function BambuVideo({
  variant,
  size = 120,
  className = '',
  loop = true,
  raw = false,
  onEnded,
}: BambuVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Eagerly try to play on mount (mobile needs this)
    video.play().catch(() => {});

    // Skip observer for raw mode — raw videos manage their own visibility
    if (raw) return;

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

  if (raw) {
    return (
      <video
        ref={videoRef}
        src={videoMap[variant]}
        loop={loop}
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={onEnded}
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
        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen"
      />
    </div>
  );
}
