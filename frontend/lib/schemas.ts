/**
 * Zod validation schemas for CLERE Core Audit Engine API.
 * Mirrors the backend validation rules for type-safe API calls.
 */

import { z } from 'zod';

export const ActorRole = z.enum(['Field', 'Dispatcher', 'MedicalControl', 'System']);
export const JurisdictionProfile = z.enum(['USA', 'PR', 'Custom']);
export const ScenarioType = z.enum([
  'Field1', 'Field2', 'Field3', 'Field4',
  'Hospital', 'AirMed', 'MassCasualty',
]);
export const ActionCategory = z.enum([
  'clinical', 'communication', 'logistics', 'authorization',
]);
export const RuleEngineResult = z.enum(['pass', 'fail', 'conditional']);
export const ClinicalPhase = z.enum(['scene', 'transport', 'hospital']);

/** Schema for POST /api/v1/events request body */
export const EventLogSchema = z.object({
  session_id: z.string().uuid('Debe ser un UUID v4 válido'),
  actor_role: ActorRole,
  actor_user_id: z.string().uuid().optional(),
  jurisdiction_profile: JurisdictionProfile,
  scenario_type: ScenarioType,
  action_category: ActionCategory,
  action_name: z.string().min(1).max(100),
  patient_id: z.string().uuid().optional(),
  clinical_phase: ClinicalPhase.optional(),
  decision_input: z.record(z.string(), z.unknown()).optional(),
  rule_engine_result: RuleEngineResult.optional(),
  response_time_ms: z.number().int().min(0).optional(),
  risk_score: z.number().int().min(0).max(100).optional(),
  protocol_reference: z.string().max(200).optional(),
  legal_relevance_flag: z.boolean().optional(),
  chaos_factor_active: z.boolean().optional(),
  score_delta: z.number().int().optional(),
});

export type EventLogInput = z.infer<typeof EventLogSchema>;

/** Schema for POST /api/v1/events response */
export const EventLogResponseSchema = z.object({
  success: z.boolean(),
  event_id: z.string().uuid(),
  hash_signature: z.string().length(64),
  chain_valid: z.boolean(),
  timestamp_utc: z.string(),
  chain_position: z.enum(['genesis', 'chained']),
});

export type EventLogResponse = z.infer<typeof EventLogResponseSchema>;

/** Schema for a single event record from the API */
export const EventRecordSchema = z.object({
  event_id: z.string().uuid(),
  session_id: z.string().uuid(),
  timestamp_utc: z.string(),
  actor_user_id: z.string().uuid().nullable(),
  actor_role: ActorRole,
  jurisdiction_profile: JurisdictionProfile,
  scenario_type: ScenarioType,
  action_category: ActionCategory,
  action_name: z.string(),
  patient_id: z.string().uuid().nullable(),
  clinical_phase: ClinicalPhase.nullable(),
  rule_engine_result: RuleEngineResult.nullable(),
  response_time_ms: z.number().nullable(),
  risk_score: z.number().nullable(),
  protocol_reference: z.string().nullable(),
  legal_relevance_flag: z.boolean(),
  chaos_factor_active: z.boolean(),
  score_delta: z.number().nullable(),
  hash_signature: z.string(),
  previous_hash: z.string().nullable(),
});

export type EventRecord = z.infer<typeof EventRecordSchema>;

/** Schema for GET /api/v1/events/session/:id response */
export const AuditTrailResponseSchema = z.object({
  success: z.boolean(),
  sessionId: z.string(),
  totalEvents: z.number(),
  chainIntegrity: z.object({
    valid: z.boolean(),
    brokenAt: z.number().nullable(),
    totalEvents: z.number(),
    message: z.string(),
  }),
  events: z.array(EventRecordSchema),
});

export type AuditTrailResponse = z.infer<typeof AuditTrailResponseSchema>;

/** Schema for GET /api/v1/events/session/:id/validate */
export const IntegrityCheckSchema = z.object({
  success: z.boolean(),
  valid: z.boolean(),
  message: z.string(),
  totalEvents: z.number(),
  brokenAt: z.number().nullable(),
  sessionId: z.string().optional(),
});

export type IntegrityCheck = z.infer<typeof IntegrityCheckSchema>;

/** Schema for health check */
export const HealthResponseSchema = z.object({
  status: z.string(),
  service: z.string(),
  version: z.string(),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
