'use client';

/**
 * Top navigation bar for the CLERE dashboard.
 * Shows brand, current page title, and backend health status.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useHealth } from '@/hooks/useEvents';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/events', label: 'Registrar Evento' },
  { href: '/audit', label: 'Audit Trail' },
  { href: '/metrics', label: 'Métricas' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: health, isError } = useHealth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isOnline = !isError && health?.status === 'ok';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Shield className="h-6 w-6 text-red-400" aria-hidden="true" />
          <span>CLERE</span>
          <span className="hidden text-slate-400 font-normal text-sm sm:inline">
            Core Audit Engine
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Backend status indicator */}
        <div
          className="hidden items-center gap-2 text-xs md:flex"
          aria-live="polite"
          aria-label={`Backend ${isOnline ? 'conectado' : 'desconectado'}`}
        >
          <Activity
            className={`h-4 w-4 ${isOnline ? 'text-green-400' : 'text-red-400'}`}
            aria-hidden="true"
          />
          <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
            {isOnline ? 'Backend OK' : 'Sin conexión'}
          </span>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden rounded-md p-2 text-slate-300 hover:bg-slate-700"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          className="border-t border-slate-700 px-4 pb-3 md:hidden"
          aria-label="Navegación móvil"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
