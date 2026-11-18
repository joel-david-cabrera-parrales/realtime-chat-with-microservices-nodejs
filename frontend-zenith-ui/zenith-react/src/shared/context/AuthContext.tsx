import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { authStorage } from "@/shared/storage/auth.storage";
import { apiClient } from "@/shared/api/api-client";
import { AuthMapper } from "@/auth/mappers/auth.mapper";
import type { SigninOutput, SignupOutput, AuthUser } from "@/auth/types";

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: SigninOutput) => void;
  register: (data: SignupOutput) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión almacenada al montar
  useEffect(() => {
    const storedUser = authStorage.getUser();
    const token = authStorage.getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((data: SigninOutput) => {
    const accessToken = AuthMapper.extractAccessToken(data);
    const refreshToken = AuthMapper.extractRefreshToken(data);
    const mappedUser = AuthMapper.signinOutputToUser(data);

    authStorage.setToken(accessToken);
    authStorage.setRefreshToken(refreshToken);
    authStorage.setUser(mappedUser);
    setUser(mappedUser);
  }, []);

  const register = useCallback((data: SignupOutput) => {
    const accessToken = AuthMapper.extractAccessToken(data);
    const refreshToken = AuthMapper.extractRefreshToken(data);
    const mappedUser = AuthMapper.signupOutputToUser(data);

    authStorage.setToken(accessToken);
    authStorage.setRefreshToken(refreshToken);
    authStorage.setUser(mappedUser);
    setUser(mappedUser);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      setUser(null);
      return;
    }

    try {
      const response = await apiClient.post<{
        data: { accessToken: string; refreshToken: string; expiresIn: number };
      }>("/api/auth/refresh", { refreshToken });

      const tokens = response.data;
      authStorage.setToken(tokens.accessToken);
      authStorage.setRefreshToken(tokens.refreshToken);
    } catch {
      authStorage.clear();
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user && !!authStorage.getToken();

  const value = {
    user,
    token: authStorage.getToken(),
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
