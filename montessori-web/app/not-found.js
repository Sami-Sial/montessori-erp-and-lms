import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <p className="font-display text-6xl font-bold text-primary/20">404</p>
        <h1 className="font-display text-2xl font-bold text-ink">Page not found</h1>
        <p className="text-muted text-sm">The page you're looking for doesn't exist.</p>
        <Link href="/" className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark focusable">
          Go home
        </Link>
      </div>
    </div>
  );
}
