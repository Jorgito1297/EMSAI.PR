'use client';

/**
 * Clinical event logging form.
 * Validates with Zod + react-hook-form pattern (manual state for simplicity).
 * Posts to backend POST /api/v1/events via useLogEvent hook.
 */

import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLogEvent } from '@/hooks/useEvents';
import { EventLogSchema, type EventLogInput } from '@/lib/schemas';
import type { ZodIssue } from 'zod';

type FormErrors = Partial<Record<keyof EventLogInput, string>>;

const INITIAL_STATE: EventLogInput = {
  session_id: '',
  actor_role: 'Field',
  jurisdiction_profile: 'USA',
  scenario_type: 'Field1',
  action_category: 'clinical',
  action_name: '',
  patient_id: undefined,
  clinical_phase: undefined,
  rule_engine_result: undefined,
  response_time_ms: undefined,
  risk_score: undefined,
};

function fieldId(base: string, id: string) {
  return `${base}-${id}`;
}

export default function EventForm() {
  const uid = useId();
  const { mutate, isPending, isSuccess, isError, data, error, reset } = useLogEvent();
  const [form, setForm] = useState<EventLogInput>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;
    const parsed =
      type === 'number' && value !== ''
        ? Number(value)
        : value === ''
          ? undefined
          : value;
    setForm((prev) => ({ ...prev, [name]: parsed }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = EventLogSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue: ZodIssue) => {
        const key = issue.path[0] as keyof EventLogInput;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    reset();
    mutate(result.data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulario de registro de evento clínico"
      className="space-y-5"
    >
      {/* IDs de Sesión y Paciente */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={fieldId('session_id', uid)}
          label="ID de Sesión *"
          name="session_id"
          value={form.session_id}
          placeholder="xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx"
          error={errors.session_id}
          onChange={handleChange}
        />
        <Field
          id={fieldId('patient_id', uid)}
          label="ID de Paciente"
          name="patient_id"
          value={form.patient_id ?? ''}
          placeholder="UUID del paciente (opcional)"
          error={errors.patient_id}
          onChange={handleChange}
        />
      </div>

      {/* Role + Jurisdiction */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          id={fieldId('actor_role', uid)}
          label="Rol del Actor *"
          name="actor_role"
          value={form.actor_role}
          error={errors.actor_role}
          onChange={handleChange}
          options={['Field', 'Dispatcher', 'MedicalControl', 'System']}
        />
        <SelectField
          id={fieldId('jurisdiction_profile', uid)}
          label="Jurisdicción *"
          name="jurisdiction_profile"
          value={form.jurisdiction_profile}
          error={errors.jurisdiction_profile}
          onChange={handleChange}
          options={['USA', 'PR', 'Custom']}
        />
        <SelectField
          id={fieldId('scenario_type', uid)}
          label="Tipo de Escenario *"
          name="scenario_type"
          value={form.scenario_type}
          error={errors.scenario_type}
          onChange={handleChange}
          options={['Field1', 'Field2', 'Field3', 'Field4', 'Hospital', 'AirMed', 'MassCasualty']}
        />
      </div>

      {/* Action */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id={fieldId('action_category', uid)}
          label="Categoría de Acción *"
          name="action_category"
          value={form.action_category}
          error={errors.action_category}
          onChange={handleChange}
          options={['clinical', 'communication', 'logistics', 'authorization']}
        />
        <Field
          id={fieldId('action_name', uid)}
          label="Nombre de la Acción *"
          name="action_name"
          value={form.action_name}
          placeholder="ej: administer_oxygen"
          error={errors.action_name}
          onChange={handleChange}
        />
      </div>

      {/* Clinical details */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          id={fieldId('clinical_phase', uid)}
          label="Fase Clínica"
          name="clinical_phase"
          value={form.clinical_phase ?? ''}
          error={errors.clinical_phase}
          onChange={handleChange}
          options={['', 'scene', 'transport', 'hospital']}
          optionLabels={{ '': '— Opcional —' }}
        />
        <SelectField
          id={fieldId('rule_engine_result', uid)}
          label="Resultado del Protocolo"
          name="rule_engine_result"
          value={form.rule_engine_result ?? ''}
          error={errors.rule_engine_result}
          onChange={handleChange}
          options={['', 'pass', 'fail', 'conditional']}
          optionLabels={{ '': '— Opcional —' }}
        />
        <Field
          id={fieldId('response_time_ms', uid)}
          label="Tiempo de Respuesta (ms)"
          name="response_time_ms"
          type="number"
          value={form.response_time_ms ?? ''}
          placeholder="ej: 3200"
          error={errors.response_time_ms}
          onChange={handleChange}
        />
      </div>

      {/* Risk score */}
      <Field
        id={fieldId('risk_score', uid)}
        label="Puntaje de Riesgo (0–100)"
        name="risk_score"
        type="number"
        value={form.risk_score ?? ''}
        placeholder="0 a 100"
        error={errors.risk_score}
        onChange={handleChange}
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        aria-busy={isPending}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Registrando…' : 'Registrar Evento'}
      </button>

      {/* Feedback */}
      <AnimatePresence>
        {isSuccess && data && (
          <SuccessBanner eventId={data.event_id} hash={data.hash_signature} />
        )}
        {isError && (
          <ErrorBanner message={(error as Error).message} />
        )}
      </AnimatePresence>
    </form>
  );
}

/* ── Sub-components ── */

function Field({
  id, label, name, value, placeholder, error, onChange, type = 'text',
}: {
  id: string; label: string; name: string; value: string | number;
  placeholder?: string; error?: string; onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
        }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id, label, name, value, error, onChange, options, optionLabels = {},
}: {
  id: string; label: string; name: string; value: string;
  error?: string; onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: string[]; optionLabels?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
        }`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {optionLabels[opt] ?? opt}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessBanner({ eventId, hash }: { eventId: string; hash: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      role="status"
      className="rounded-lg border border-green-200 bg-green-50 p-4"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-green-800">Evento registrado correctamente</p>
          <p className="mt-1 break-all text-xs text-green-700">ID: {eventId}</p>
          <p className="break-all text-xs text-green-700">Hash: {hash}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" aria-hidden="true" />
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </motion.div>
  );
}
