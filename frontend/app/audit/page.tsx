import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import AuditTrail from '@/components/AuditTrail';

export const metadata: Metadata = { title: 'Audit Trail' };

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-white"
          aria-hidden="true"
        >
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Audit Trail de Sesión</h1>
          <p className="text-sm text-slate-500">
            Consulta el historial completo de eventos y verifica la integridad de la cadena de hash.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <AuditTrail />
      </div>
    </div>
  );
}
