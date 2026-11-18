import type {
  SigninOutput,
  SignupOutput,
  TokenPair,
  AuthUser,
} from "../types";

/**
 * AuthMapper
 *
 * Clase con métodos estáticos para mapear las respuestas del backend
 * (identity-service) a las entidades del frontend.
 */
export class AuthMapper {
  /**
   * Mapea un TokenPair del backend a un objeto del frontend.
   */
  static toTokenPair(data: TokenPair): TokenPair {
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenType: data.tokenType,
      expiresIn: data.expiresIn,
    };
  }

  /**
   * Mapea un SigninOutput del backend a AuthUser (entidad del frontend).
   */
  static signinOutputToUser(data: SigninOutput): AuthUser {
    return {
      id: data.credentialCode,
      credentialId: data.credentialId,
      credentialCode: data.credentialCode,
      profileCode: data.profileCode,
    };
  }

  /**
   * Mapea un SignupOutput del backend a AuthUser (entidad del frontend).
   */
  static signupOutputToUser(data: SignupOutput): AuthUser {
    return {
      id: data.credentialCode,
      credentialId: data.credentialId,
      credentialCode: data.credentialCode,
      profileCode: data.profileCode,
    };
  }

  /**
   * Extrae el accessToken de un SigninOutput.
   */
  static extractAccessToken(data: SigninOutput | SignupOutput): string {
    return data.tokens.accessToken;
  }

  /**
   * Extrae el refreshToken de un SigninOutput.
   */
  static extractRefreshToken(data: SigninOutput | SignupOutput): string {
    return data.tokens.refreshToken;
  }
}
