import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import '@/styles/globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#2979FF',
};

export const metadata: Metadata = {
  title: 'eSIM Panda',
  description: 'Get connected with mobile data anywhere in the world',
};

const swRegistrationScript = `if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' });
}`;

const darkModeHydrationScript = `try {
  var stored = JSON.parse(localStorage.getItem('esim-panda-theme') || '{}');
  if (stored.state && stored.state.isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
} catch (e) {}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head />
      <body className="font-sans antialiased bg-background dark:bg-background-dark text-primary dark:text-gray-100 transition-colors">
        <script dangerouslySetInnerHTML={{ __html: darkModeHydrationScript }} />
        <script dangerouslySetInnerHTML={{ __html: swRegistrationScript }} />
        {children}
      </body>
    </html>
  );
}
