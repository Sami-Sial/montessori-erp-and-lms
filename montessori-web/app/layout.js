import '../styles/globals.css';
import { Providers } from '../components/shared/Providers';

export const metadata = {
  title: {
    default: 'Montessori Platform',
    template: '%s | Montessori Platform',
  },
  description: 'Multi-tenant Montessori ERP & Learning Management System — manage students, curriculum, attendance, finance, and staff in one platform.',
  manifest: '/manifest.json',
  themeColor: '#3E4C8C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Montessori',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
  },
  openGraph: {
    title: 'Montessori Platform',
    description: 'Multi-tenant Montessori ERP & Learning Management System',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Inline SVG favicon for browsers that don't pick up app/icon.svg automatically */}
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%233E4C8C'/%3E%3Cpath d='M16 8L4 13.5L16 19L28 13.5L16 8Z' fill='white' opacity='.95'/%3E%3Cpath d='M7 15.2V21C7 21 10.5 23.5 16 23.5C21.5 23.5 25 21 25 21V15.2L16 19.5L7 15.2Z' fill='white' opacity='.75'/%3E%3Cline x1='28' y1='13.5' x2='28' y2='20' stroke='white' stroke-width='1.5' stroke-linecap='round' opacity='.85'/%3E%3Ccircle cx='28' cy='21' r='1.2' fill='white' opacity='.85'/%3E%3C/svg%3E"
        />
        {/* Fallback for older browsers */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
