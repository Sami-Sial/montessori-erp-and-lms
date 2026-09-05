/**
 * Root route — serves two completely different experiences:
 *
 *  Unauthenticated visitors  →  Public marketing homepage (Server Component, no JS needed)
 *  Users with a saved token  →  Client-side redirect to dashboard-redirect
 *
 * The trick: render the homepage content as-is (Server Component),
 * and overlay a thin Client Component that reads localStorage and
 * redirects authenticated users WITHOUT blocking the initial render.
 */
import HomePageContent from '../components/marketing/HomePageContent';
import Navbar from '../components/marketing/Navbar';
import Footer from '../components/marketing/Footer';
import AuthRedirector from '../components/shared/AuthRedirector';

export default function RootPage() {
  return (
    <>
      {/*
        AuthRedirector is a Client Component that runs after hydration.
        If a refreshToken exists in localStorage it silently replaces the
        URL with /dashboard-redirect — no flash, no blocking the render.
      */}
      <AuthRedirector />

      {/* Public homepage — visible to everyone until redirect fires */}
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 pt-16">
          <HomePageContent />
        </main>
        <Footer />
      </div>
    </>
  );
}
