'use client';

import { useRef, useEffect } from 'react';

type BambuVariant = 'splash' | 'loading' | 'success' | 'error' | 'empty' | 'browse' | 'preparing' | 'welcome';

interface BambuVideoProps {
  variant: BambuVariant;
  size?: number;
  className?: string;
  loop?: boolean;
  onEnded?: () => void;
}

const videoMap: Record<BambuVariant, string> = {
  splash: '/bambu/splash.mp4',
  loading: '/bambu/loading.mp4',
  success: '/bambu/success.mp4',
  error: '/bambu/error.mp4',
  empty: '/bambu/empty.mp4',
  browse: '/bambu/browse.mp4',
  preparing: '/bambu/preparing.mp4',
  welcome: '/bambu/welcome.mp4',
};

export function BambuVideo({
  variant,
  size = 120,
  className = '',
  loop = true,
  onEnded,
}: BambuVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Lazy play: only play when visible in viewport
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );

    observerRef.current.observe(video);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

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
        className="w-full h-full object-cover dark:mix-blend-screen"
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  );
}
