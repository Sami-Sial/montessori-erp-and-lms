import '../styles/globals.css';
import { Providers } from '../components/shared/Providers';

export const metadata = {
  title: {
    default: 'Montessori Platform',
    template: '%s | Montessori Platform',
  },
  description: 'Multi-tenant Montessori ERP & Learning Management System',
  manifest: '/manifest.json',
  themeColor: '#3E4C8C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Montessori',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
