import { ImageResponse } from 'next/og';

// Default social-share card for the site. Destination pages override this with
// their own `openGraph.images` (the destination photo); home/browse use this.
export const alt = 'eSIM Panda — Affordable travel eSIM data plans worldwide';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '90px',
          background: 'linear-gradient(135deg, #2979FF 0%, #1858C4 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: 8,
            textTransform: 'uppercase',
            opacity: 0.85,
            marginBottom: 24,
          }}
        >
          eSIM Panda
        </div>
        <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
          Get connected anywhere
        </div>
        <div style={{ fontSize: 40, fontWeight: 500, marginTop: 28, opacity: 0.92, maxWidth: 880 }}>
          Affordable travel eSIM data plans for 190+ destinations. Online in under 2 minutes.
        </div>
      </div>
    ),
    { ...size }
  );
}
