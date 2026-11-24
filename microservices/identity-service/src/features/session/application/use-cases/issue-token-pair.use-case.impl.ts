import { Token } from "../../domain/aggregates/token.aggregate";
import { ACCESS_TOKEN_EXPIRES_IN_SECONDS, REFRESH_TOKEN_EXPIRES_IN_SECONDS, TOKEN_TYPE } from "../../domain/constants/token.constants";
import { TokenRepository } from "../../domain/repositories/token.repository";
import { IssueTokenPairInput, TokenPair } from "../../domain/use-cases/dtos/issue-token-pair.dto";
import { IssueTokenPairUseCase } from "../../domain/use-cases/issue-token-pair.use-case";
import { AccessToken } from "../../domain/value-objects/access-token.value-object";
import { RefreshToken } from "../../domain/value-objects/refresh-token.value-object";
import { HashService } from "../../../../shared/domain/services/hash.service";
import { TokenService } from "../../../../shared/domain/services/token.generator.service";

export class IssueTokenPairUseCaseImpl extends IssueTokenPairUseCase {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly tokenService: TokenService,
    private readonly hashService: HashService,
  ) {
    super();
  }

  public async issue(input: IssueTokenPairInput): Promise<TokenPair> {
    const payload: Record<string, unknown> = {
      sessionId: input.sessionId,
      credentialId: input.credentialId,
      credentialCode: input.credentialCode,
      profileCode: input.profileCode,
      username: input.username,
    };

    const accessToken = AccessToken.create(this.tokenService.generateAccessToken(payload));
    const refreshToken = RefreshToken.create(this.tokenService.generateRefreshToken(payload));

    const hash = await this.hashService.hashToken(refreshToken.value);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000);

    const token = Token.create({
      sessionId: input.sessionId,
      credentialId: input.credentialId,
      profileCode: input.profileCode,
      hash,
      expiresAt,
    });

    await this.tokenRepository.save(token);

    return {
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      tokenType: TOKEN_TYPE,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    };
  }
}
