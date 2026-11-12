import { Token } from "../../domain/aggregates/token.aggregate";
import { InvalidTokenException } from "../../domain/exceptions/invalid-token.exception";
import { SessionExpiredException } from "../../domain/exceptions/session-expired.exception";
import { SessionNotFoundException } from "../../domain/exceptions/session-not-found.exception";
import { TokenExpiredException } from "../../domain/exceptions/token-expired.exception";
import { TokenNotFoundException } from "../../domain/exceptions/token-not-found.exception";
import { TokenRevokedException } from "../../domain/exceptions/token-revoked.exception";
import { TokenIssuer } from "../../domain/interfaces/token-issuer.interface";
import { TokenPayload } from "../../domain/interfaces/token.interface";
import { SessionRepository } from "../../domain/repositories/session.repository";
import { TokenRepository } from "../../domain/repositories/token.repository";
import { RefreshTokenPairInput, RefreshTokenPairOutput } from "../../domain/use-cases/dtos/refresh-token-pair.dto";
import { RefreshTokenPairUseCase } from "../../domain/use-cases/refresh-token-pair.use-case";
import { SessionId } from "../../domain/value-objects/session-id.value-object";
import { TokenStatus } from "../../domain/value-objects/token-status.value-object";
import { HashService } from "../../../shared/domain/hash.service";
import { TokenService } from "../../../shared/domain/token.generator.service";

export class RefreshTokenPairUseCaseImpl extends RefreshTokenPairUseCase {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly tokenService: TokenService,
    private readonly hashService: HashService,
    private readonly tokenIssuer: TokenIssuer,
  ) {
    super();
  }

  public async execute(input: RefreshTokenPairInput): Promise<RefreshTokenPairOutput> {
    const payload = this.verifyPayload(input.refreshToken);
    const sessionId = SessionId.create(payload.sessionId);

    const storedToken = await this.findMatchingToken(sessionId, input.refreshToken);

    if (storedToken === null) {
      throw new TokenNotFoundException(payload.sessionId);
    }

    const session = await this.sessionRepository.findById(sessionId);

    if (session === null) {
      throw new SessionNotFoundException(payload.sessionId);
    }

    if (session.expireIfNeeded()) {
      await this.sessionRepository.save(session);
    }

    if (!session.isActive()) {
      throw new SessionExpiredException();
    }

    if (storedToken.expireIfNeeded()) {
      await this.tokenRepository.save(storedToken);
    }

    if (!storedToken.isActive()) {
      if (storedToken.status.value === TokenStatus.revoked) {
        throw new TokenRevokedException();
      }
      throw new TokenExpiredException();
    }

    storedToken.revoke();
    session.touch();

    await this.tokenRepository.save(storedToken);
    await this.sessionRepository.save(session);

    return this.tokenIssuer.issue({
      sessionId: sessionId.value,
      credentialId: storedToken.credentialId,
      profileCode: storedToken.profileCode.value,
      username: payload.username,
    });
  }

  private async findMatchingToken(sessionId: SessionId, refreshToken: string): Promise<Token | null> {
    const tokens = await this.tokenRepository.findBySessionId(sessionId);

    for (const token of tokens) {
      const matches = await this.hashService.verifyTokenHash(token.hash.value, refreshToken);

      if (matches) {
        return token;
      }
    }

    return null;
  }

  private verifyPayload(refreshToken: string): TokenPayload {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken) as unknown as TokenPayload;

      if (!payload.sessionId || !payload.credentialId || !payload.profileCode || !payload.username) {
        throw new Error("Invalid refresh token payload");
      }

      return payload;
    } catch {
      throw new InvalidTokenException();
    }
  }
}
