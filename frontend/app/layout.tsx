import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: { default: 'CLERE – Core Audit Engine', template: '%s | CLERE CAE' },
  description:
    'Dashboard de auditoría clínica para CLERE – Centro de Liderazgo en Respuestas a Emergencias.',
  keywords: ['CLERE', 'EMS', 'clinical audit', 'emergency simulation'],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-slate-50 text-slate-900">
        <Providers>
          <Navbar />
          <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
