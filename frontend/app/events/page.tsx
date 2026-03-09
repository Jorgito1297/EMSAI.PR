import type { Metadata } from 'next';
import EventForm from '@/components/EventForm';
import { FileText } from 'lucide-react';

export const metadata: Metadata = { title: 'Registrar Evento' };

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white"
            aria-hidden="true"
          >
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Registrar Evento Clínico</h1>
            <p className="text-sm text-slate-500">
              Cada envío genera una firma SHA-256 y se encadena al último evento de la sesión.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <EventForm />
          </div>
        </div>

        {/* Info sidebar */}
        <aside aria-label="Información del audit log" className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">¿Cómo funciona?</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-600" aria-label="Pasos del proceso">
              {[
                'Se obtiene el último hash de la sesión.',
                'Se calcula SHA-256(datos + hash_anterior).',
                'El evento se persiste con su firma en PostgreSQL.',
                'La cadena es verificable en cualquier momento.',
              ].map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">⚠️ Inmutabilidad</p>
            <p className="mt-1">
              Los eventos registrados no pueden editarse ni eliminarse. El sistema
              garantiza la integridad del audit trail para fines legales y académicos.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Roles de Actor</p>
            <ul className="mt-2 space-y-1">
              {[
                ['Field', 'Paramédico / Técnico en campo'],
                ['Dispatcher', 'Despachador de emergencias'],
                ['MedicalControl', 'Control médico / Director médico'],
                ['System', 'Acción automática del sistema'],
              ].map(([role, desc]) => (
                <li key={role}>
                  <span className="font-medium">{role}:</span> {desc}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
