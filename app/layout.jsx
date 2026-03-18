import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar.jsx';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Raksham India — Universal Safety Shield',
  description:
    'AI-powered phishing and scam detection in Hindi, Marathi, Tamil and English. Protecting your family from digital fraud.',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/icon-512.png' },
  ],
};

export const viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="hi" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900 min-h-screen selection:bg-indigo-100 selection:text-indigo-900`}
        style={{ fontFamily: 'var(--font-geist-sans), Noto Sans Devanagari, Noto Sans Tamil, sans-serif' }}
      >
        <Toaster richColors position="top-center" />
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
