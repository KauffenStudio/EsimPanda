import Link from 'next/link';

// Rendered inside the locale layout (which provides <html>/<body> and the
// intl provider). Kept text static to avoid depending on a translation key.
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-24">
      <p className="text-5xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold text-primary dark:text-gray-100">Page not found</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-[40ch]">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
