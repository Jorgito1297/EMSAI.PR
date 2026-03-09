'use client';

/**
 * Performance Metrics client component — CLERE indices display.
 * Separated from page.tsx so the server wrapper can export metadata.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Search, Brain, Heart, Zap, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import StatCard from '@/components/StatCard';
import type { LucideIcon } from 'lucide-react';

interface ClereIndex {
  key: string;
  name: string;
  fullName: string;
  description: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple';
}

const CLERE_INDICES: ClereIndex[] = [
  {
    key: 'ccpi',
    name: 'CCPI',
    fullName: 'CLERE Clinical Performance Index',
    description: 'Precisión y calidad de las decisiones clínicas durante la simulación.',
    icon: Heart,
    color: 'red',
  },
  {
    key: 'csai',
    name: 'CSAI',
    fullName: 'CLERE Stress Adaptation Index',
    description: 'Capacidad de mantener rendimiento clínico bajo condiciones de estrés.',
    icon: Zap,
    color: 'amber',
  },
  {
    key: 'ccss',
    name: 'CCSS',
    fullName: 'CLERE Cognitive Stability Score',
    description: 'Consistencia cognitiva ante variables caóticas e impredecibles.',
    icon: Brain,
    color: 'purple',
  },
  {
    key: 'cldl',
    name: 'CLDL',
    fullName: 'CLERE Leadership Development Level',
    description: 'Indicadores de liderazgo en comunicación, coordinación y toma de decisiones.',
    icon: Star,
    color: 'blue',
  },
];

interface MetricsData {
  session_id: string;
  user_id: string;
  ccpi: number | null;
  csai: number | null;
  ccss: number | null;
  cldl: number | null;
  clinical_accuracy_percent: number | null;
  decision_time_average_ms: number | null;
  overall_simulation_score: number | null;
  completed_at: string;
}

const MetricsDataSchema = z.object({
  session_id: z.string(),
  user_id: z.string(),
  ccpi: z.number().nullable(),
  csai: z.number().nullable(),
  ccss: z.number().nullable(),
  cldl: z.number().nullable(),
  clinical_accuracy_percent: z.number().nullable(),
  decision_time_average_ms: z.number().nullable(),
  overall_simulation_score: z.number().nullable(),
  completed_at: z.string(),
});

const MetricsResponseSchema = z.object({
  success: z.boolean(),
  metrics: MetricsDataSchema,
});

async function fetchMetrics(sessionId: string): Promise<MetricsData> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${BASE_URL}/api/v1/metrics/session/${sessionId}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  const json: unknown = await res.json();
  const parsed = MetricsResponseSchema.parse(json);
  return parsed.metrics;
}

const ICON_COLOR_MAP: Record<ClereIndex['color'], string> = {
  red: 'bg-red-100 text-red-600',
  amber: 'bg-amber-100 text-amber-600',
  purple: 'bg-purple-100 text-purple-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
};

export default function MetricsClient() {
  const [sessionId, setSessionId] = useState('');
  const [query, setQuery] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['metrics', query],
    queryFn: () => fetchMetrics(query),
    enabled: query.length > 0,
    retry: 1,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(sessionId.trim());
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white"
          aria-hidden="true"
        >
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Métricas de Rendimiento CLERE</h1>
          <p className="text-sm text-slate-500">
            Índices neurocognitivos y de liderazgo clínico por sesión de simulación.
          </p>
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2"
        aria-label="Buscar métricas por Session ID"
      >
        <label htmlFor="metrics-search" className="sr-only">Session ID</label>
        <input
          id="metrics-search"
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Ingresa el Session UUID…"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Buscar métricas"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Buscar
        </button>
      </form>

      {isLoading && <LoadingSpinner label="Cargando métricas…" />}
      {isError && (
        <ErrorAlert message={(error as Error).message} onRetry={() => refetch()} />
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {data.overall_simulation_score !== null && (
            <StatCard
              title="Puntuación Total de Simulación"
              value={`${data.overall_simulation_score}/100`}
              subtitle={`Completado: ${new Date(data.completed_at).toLocaleString('es-PR')}`}
              icon={BarChart3}
              color="blue"
            />
          )}

          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Índices CLERE</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CLERE_INDICES.map(({ key, name, fullName, icon, color }) => {
                const val = data[key as keyof MetricsData] as number | null;
                return (
                  <StatCard
                    key={key}
                    title={name}
                    value={val !== null ? `${val}` : '—'}
                    subtitle={fullName}
                    icon={icon}
                    color={color}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {data.clinical_accuracy_percent !== null && (
              <StatCard
                title="Precisión Clínica"
                value={`${data.clinical_accuracy_percent}%`}
                icon={Heart}
                color="green"
              />
            )}
            {data.decision_time_average_ms !== null && (
              <StatCard
                title="Tiempo Decisión Promedio"
                value={`${data.decision_time_average_ms} ms`}
                icon={Zap}
                color="amber"
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!query && !data && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Índices de Evaluación Neurocognitiva
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CLERE_INDICES.map(({ name, fullName, description, icon: Icon, color }) => (
              <div key={name} className="flex gap-3">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${ICON_COLOR_MAP[color]}`}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{name}</p>
                  <p className="text-xs text-slate-500">{fullName}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Ingresa un Session UUID arriba para ver los índices de esa simulación.
          </p>
        </div>
      )}
    </div>
  );
}
