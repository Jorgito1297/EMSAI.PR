'use client';

/**
 * TanStack Query custom hooks for CLERE audit events.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logEvent, getAuditTrail, validateSession, getHealth } from '@/lib/api';
import type { EventLogInput } from '@/lib/schemas';

export const queryKeys = {
  health: ['health'] as const,
  auditTrail: (sessionId: string) => ['auditTrail', sessionId] as const,
  integrity: (sessionId: string) => ['integrity', sessionId] as const,
};

/** Fetch backend health status */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: getHealth,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/** Fetch complete session audit trail */
export function useAuditTrail(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.auditTrail(sessionId),
    queryFn: () => getAuditTrail(sessionId),
    enabled: enabled && sessionId.length > 0,
  });
}

/** Validate hash chain integrity for a session */
export function useIntegrityCheck(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.integrity(sessionId),
    queryFn: () => validateSession(sessionId),
    enabled: enabled && sessionId.length > 0,
  });
}

/** Mutation to log a new clinical event */
export function useLogEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EventLogInput) => logEvent(payload),
    onSuccess: (_data, variables) => {
      // Invalidate audit trail cache for the session that was just updated
      queryClient.invalidateQueries({
        queryKey: queryKeys.auditTrail(variables.session_id),
      });
      // Also invalidate the integrity check for the same session
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrity(variables.session_id),
      });
    },
  });
}
