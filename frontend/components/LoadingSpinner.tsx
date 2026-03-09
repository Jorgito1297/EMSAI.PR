/**
 * Spinner used for suspense / loading states.
 */

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export default function LoadingSpinner({
  label = 'Cargando…',
  size = 'md',
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500"
    >
      <Loader2 className={`${SIZE_MAP[size]} animate-spin text-blue-600`} aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
