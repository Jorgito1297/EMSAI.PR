'use client';

/**
 * Session audit trail viewer.
 * Shows ordered events with hash chain integrity status.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuditTrail } from '@/hooks/useEvents';
import HashBadge from './HashBadge';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import type { EventRecord } from '@/lib/schemas';

const CATEGORY_COLORS: Record<string, string> = {
  clinical: 'bg-blue-100 text-blue-700',
  communication: 'bg-purple-100 text-purple-700',
  logistics: 'bg-amber-100 text-amber-700',
  authorization: 'bg-green-100 text-green-700',
};

const RESULT_COLORS: Record<string, string> = {
  pass: 'text-green-600',
  fail: 'text-red-600',
  conditional: 'text-amber-600',
};

export default function AuditTrail() {
  const [sessionId, setSessionId] = useState('');
  const [query, setQuery] = useState('');

  const { data, isLoading, isError, error, refetch } = useAuditTrail(
    query,
    query.length > 0,
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(sessionId.trim());
  }

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2"
        aria-label="Buscar sesión por ID"
      >
        <label htmlFor="session-search" className="sr-only">
          Session ID
        </label>
        <input
          id="session-search"
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Ingresa el Session UUID…"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Buscar audit trail"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Buscar
        </button>
      </form>

      {/* Results */}
      {isLoading && <LoadingSpinner label="Cargando audit trail…" />}
      {isError && (
        <ErrorAlert
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <div className="space-y-4">
          {/* Summary header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-500">Session</p>
              <p className="font-mono text-sm font-medium break-all">{data.sessionId}</p>
            </div>
            <HashBadge
              valid={data.chainIntegrity.valid}
              totalEvents={data.totalEvents}
              brokenAt={data.chainIntegrity.brokenAt}
            />
          </div>

          {/* Events list */}
          {data.events.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No se encontraron eventos para esta sesión.
            </p>
          ) : (
            <ol className="space-y-2" aria-label="Lista de eventos del audit trail">
              {data.events.map((event, idx) => (
                <EventRow key={event.event_id} event={event} index={idx} />
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

function EventRow({ event, index }: { event: EventRecord; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const categoryClass =
    CATEGORY_COLORS[event.action_category] ?? 'bg-slate-100 text-slate-700';
  const resultClass = event.rule_engine_result
    ? RESULT_COLORS[event.rule_engine_result] ?? ''
    : '';

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded={expanded}
        aria-controls={`event-detail-${event.event_id}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex-shrink-0 text-xs font-mono text-slate-400 w-6 text-right">
            {index + 1}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${categoryClass}`}
          >
            {event.action_category}
          </span>
          <span className="truncate text-sm font-medium text-slate-800">
            {event.action_name}
          </span>
          <span className="flex-shrink-0 text-xs text-slate-500">
            {event.actor_role}
          </span>
          {event.rule_engine_result && (
            <span className={`flex-shrink-0 text-xs font-semibold ${resultClass}`}>
              {event.rule_engine_result}
            </span>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="hidden text-xs text-slate-400 sm:block">
            {new Date(event.timestamp_utc).toLocaleTimeString('es-PR')}
          </span>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
            : <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
          }
        </div>
      </button>

      {expanded && (
        <div
          id={`event-detail-${event.event_id}`}
          className="border-t border-slate-100 p-3"
        >
          <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
            <Detail label="Event ID" value={event.event_id} mono />
            <Detail label="Session ID" value={event.session_id} mono />
            <Detail
              label="Timestamp UTC"
              value={new Date(event.timestamp_utc).toLocaleString('es-PR')}
            />
            <Detail label="Jurisdicción" value={event.jurisdiction_profile} />
            <Detail label="Escenario" value={event.scenario_type} />
            <Detail label="Fase" value={event.clinical_phase ?? '—'} />
            {event.response_time_ms !== null && (
              <Detail label="Tiempo respuesta" value={`${event.response_time_ms} ms`} />
            )}
            {event.risk_score !== null && (
              <Detail label="Risk Score" value={String(event.risk_score)} />
            )}
            <div className="sm:col-span-2">
              <dt className="font-medium text-slate-500">Hash Signature</dt>
              <dd className="break-all font-mono text-slate-700">{event.hash_signature}</dd>
            </div>
          </dl>
        </div>
      )}
    </motion.li>
  );
}

function Detail({
  label, value, mono = false,
}: {
  label: string; value: string; mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className={`truncate text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
