import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import type { ApiResponse, Profile } from '@/auth/types';
import { queryKeys } from '@/shared/api/queryKeys';

export interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useProfile
 *
 * Consume el endpoint GET /api/profile/:id del user-profile-service
 * (a través del API Gateway) y expone el perfil del usuario autenticado.
 *
 * @param profileId - UUID del perfil (proviene de AuthUser.profileCode).
 *                    Si no se provee, no se hace la petición.
 */
export function useProfile(profileId?: string): UseProfileReturn {
  const query = useQuery({
    queryKey: queryKeys.profile(profileId ?? ''),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Profile>>(`/api/profile/${profileId}`);
      return response.data;
    },
    enabled: Boolean(profileId),
  });

  const refetch = useCallback(async () => {
    if (!profileId) return;
    await query.refetch();
  }, [profileId, query.refetch]);

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch,
  };
}
