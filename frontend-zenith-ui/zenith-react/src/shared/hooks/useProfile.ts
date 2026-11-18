import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/api/api-client';
import type { ApiResponse, Profile } from '@/auth/types';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!profileId) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiResponse<Profile>>(
        `/api/profile/${profileId}`,
      );
      setProfile(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar el perfil',
      );
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
