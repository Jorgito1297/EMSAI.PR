'use client';

/**
 * TanStack Query custom hooks for CLERE session management.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSession, getSession, updateSessionStatus } from '@/lib/api';
import type { CreateSessionInput, UpdateSessionStatusInput } from '@/lib/schemas';

export const sessionQueryKeys = {
  session: (sessionId: string) => ['session', sessionId] as const,
};

/** Fetch session status and information */
export function useSession(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: sessionQueryKeys.session(sessionId),
    queryFn: () => getSession(sessionId),
    enabled: enabled && sessionId.length > 0,
  });
}

/** Mutation to create a new simulation session */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSessionInput) => createSession(payload),
    onSuccess: (data) => {
      // Invalidate so that a subsequent getSession call fetches fresh data
      queryClient.invalidateQueries({
        queryKey: sessionQueryKeys.session(data.session_id),
      });
    },
  });
}

/** Mutation to update session status */
export function useUpdateSessionStatus(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSessionStatusInput) =>
      updateSessionStatus(sessionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionQueryKeys.session(sessionId),
      });
    },
  });
}
