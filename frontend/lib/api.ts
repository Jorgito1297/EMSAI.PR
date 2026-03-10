/**
 * CLERE API client — typed fetch wrappers for all backend endpoints.
 * Uses environment variable NEXT_PUBLIC_API_URL for the base URL.
 */

import {
  EventLogInput,
  EventLogResponse,
  EventLogResponseSchema,
  AuditTrailResponse,
  AuditTrailResponseSchema,
  IntegrityCheck,
  IntegrityCheckSchema,
  HealthResponse,
  HealthResponseSchema,
  CreateSessionInput,
  CreateSessionResponse,
  CreateSessionResponseSchema,
  GetSessionResponse,
  GetSessionResponseSchema,
  UpdateSessionStatusInput,
  UpdateSessionStatusResponse,
  UpdateSessionStatusResponseSchema,
} from './schemas';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/** Generic fetch helper with error handling */
async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  const body = await res.json();

  if (!res.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String(body.error)
        : `HTTP ${res.status}`;
    throw new Error(message);
  }

  return body as T;
}

/** POST /api/v1/events — log a clinical event */
export async function logEvent(
  payload: EventLogInput,
): Promise<EventLogResponse> {
  const data = await apiFetch<unknown>('/api/v1/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return EventLogResponseSchema.parse(data);
}

/** GET /api/v1/events/:eventId — retrieve a single event */
export async function getEvent(
  eventId: string,
): Promise<Record<string, unknown>> {
  const data = await apiFetch<{ success: boolean; event: Record<string, unknown> }>(
    `/api/v1/events/${eventId}`,
  );
  return data.event;
}

/** GET /api/v1/events/session/:sessionId — full audit trail */
export async function getAuditTrail(
  sessionId: string,
): Promise<AuditTrailResponse> {
  const data = await apiFetch<unknown>(
    `/api/v1/events/session/${sessionId}`,
  );
  return AuditTrailResponseSchema.parse(data);
}

/** GET /api/v1/events/session/:sessionId/validate — chain integrity */
export async function validateSession(
  sessionId: string,
): Promise<IntegrityCheck> {
  const data = await apiFetch<unknown>(
    `/api/v1/events/session/${sessionId}/validate`,
  );
  return IntegrityCheckSchema.parse(data);
}

/** GET /health — backend health check */
export async function getHealth(): Promise<HealthResponse> {
  const data = await apiFetch<unknown>('/health');
  return HealthResponseSchema.parse(data);
}

/** POST /api/v1/sessions — create a new simulation session */
export async function createSession(
  payload: CreateSessionInput,
): Promise<CreateSessionResponse> {
  const data = await apiFetch<unknown>('/api/v1/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return CreateSessionResponseSchema.parse(data);
}

/** GET /api/v1/sessions/:sessionId — get session status and info */
export async function getSession(
  sessionId: string,
): Promise<GetSessionResponse> {
  const data = await apiFetch<unknown>(`/api/v1/sessions/${sessionId}`);
  return GetSessionResponseSchema.parse(data);
}

/** PATCH /api/v1/sessions/:sessionId/status — update session status */
export async function updateSessionStatus(
  sessionId: string,
  payload: UpdateSessionStatusInput,
): Promise<UpdateSessionStatusResponse> {
  const data = await apiFetch<unknown>(`/api/v1/sessions/${sessionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return UpdateSessionStatusResponseSchema.parse(data);
}
