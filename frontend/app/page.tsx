import type { Metadata } from 'next';
import { Activity, FileText, Shield, BarChart3, Server, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Dashboard' };

const QUICK_LINKS = [
  {
    href: '/events',
    title: 'Registrar Evento',
    description: 'Loguea una decisión clínica con firma hash inmutable.',
    icon: FileText,
    color: 'bg-blue-600',
  },
  {
    href: '/audit',
    title: 'Audit Trail',
    description: 'Consulta el historial de eventos de una sesión.',
    icon: Shield,
    color: 'bg-slate-700',
  },
  {
    href: '/metrics',
    title: 'Métricas CLERE',
    description: 'Índices CCPI, CSAI, CCSS y CLDL por sesión.',
    icon: BarChart3,
    color: 'bg-purple-600',
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Hash Chain Inmutable',
    body: 'Cada evento firma criptográficamente al anterior — ningún dato puede alterarse sin detección.',
  },
  {
    icon: Activity,
    title: 'Audit Trail Legal',
    body: 'Trazabilidad completa para reportes médico-legales y forenses con validez académica.',
  },
  {
    icon: Users,
    title: 'Perfilación Neurocognitiva',
    body: 'Métricas invisibles CCPI, CSAI, CCSS y CLDL para evaluar liderazgo clínico.',
  },
  {
    icon: Server,
    title: 'Multi-Jurisdicción',
    body: 'Soporte para protocolos de EMS de Estados Unidos, Puerto Rico y configuraciones personalizadas.',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section aria-labelledby="hero-heading">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-10 text-white shadow-xl sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
            CLERE · Core Audit Engine v1.0
          </p>
          <h1
            id="hero-heading"
            className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Centro de Liderazgo en Respuestas a Emergencias
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            La infraestructura fundacional de CLERE — registro inmutable de eventos
            clínicos con cadena de hash blockchain-style para validez legal y académica.
          </p>
          <p className="mt-4 text-sm italic text-slate-400">
            &ldquo;Aprende Jugando. Responde con Excelencia.&rdquo;
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="mb-4 text-lg font-semibold text-slate-800">
          Acciones Rápidas
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map(({ href, title, description, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} text-white`}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 group-hover:text-blue-600">
                  {title}
                </p>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="mb-4 text-lg font-semibold text-slate-800">
          Capacidades del Sistema
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stack note */}
      <footer className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        <p>
          <strong className="text-slate-700">Stack:</strong>{' '}
          Next.js 16 · React 19 · TypeScript strict · Tailwind CSS 4 ·
          TanStack Query · Zod · Framer Motion · Lucide React
        </p>
        <p className="mt-1">
          <strong className="text-slate-700">Backend CAE:</strong>{' '}
          Node.js · Express · PostgreSQL · SHA-256 Hash Chain
        </p>
      </footer>
    </div>
  );
}
