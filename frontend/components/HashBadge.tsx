/**
 * Hash chain integrity badge — shows chain valid/broken status.
 */

import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

interface HashBadgeProps {
  valid?: boolean;
  loading?: boolean;
  totalEvents?: number;
  brokenAt?: number | null;
  className?: string;
}

export default function HashBadge({
  valid,
  loading,
  totalEvents,
  brokenAt,
  className = '',
}: HashBadgeProps) {
  if (loading) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ${className}`}
        aria-label="Verificando integridad…"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Verificando…
      </span>
    );
  }

  if (valid === undefined) {
    return null;
  }

  if (valid) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 ${className}`}
        role="status"
        aria-label={`Cadena íntegra, ${totalEvents ?? 0} eventos`}
      >
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Cadena válida{totalEvents !== undefined ? ` · ${totalEvents} eventos` : ''}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 ${className}`}
      role="alert"
      aria-label={`Cadena comprometida en evento ${brokenAt}`}
    >
      <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
      Cadena comprometida
      {brokenAt !== null && brokenAt !== undefined ? ` · evento #${brokenAt}` : ''}
    </span>
  );
}
