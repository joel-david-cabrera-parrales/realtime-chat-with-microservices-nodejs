// ==========================================
// Interfaces por cada respuesta del backend (identity-service)
// ==========================================

// Envelope genérico que usa el backend en todas sus respuestas
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

// Token pair devuelto por signin, signup y refresh
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

// Sesión del usuario (parte de SigninOutput / SignupOutput)
export interface SessionOutput {
  id: string;
  credentialId: number;
  profileCode: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActivityAt: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Respuesta de signin (POST /api/auth/signin)
export interface SigninOutput {
  authenticated: true;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  session: SessionOutput;
  tokens: TokenPair;
}

// Respuesta de signup (POST /api/auth/signup)
export interface SignupOutput {
  authenticated: true;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  session: SessionOutput;
  tokens: TokenPair;
}

// Respuesta de refresh (POST /api/auth/refresh)
export interface RefreshOutput extends TokenPair {}

// Entidad de usuario del frontend (mapeada desde el backend)
export interface AuthUser {
  id: string;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  email?: string;
  fullName?: string;
}

// Cuerpo de petición de login
export interface SigninRequestBody {
  username: string;
  password: string;
}

// Cuerpo de petición de registro
export interface SignupRequestBody {
  username: string;
  password: string;
  profile: {
    fullName: string;
    email: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
  };
}
