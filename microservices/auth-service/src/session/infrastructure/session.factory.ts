import { Router } from "express";
import { DataSource } from "typeorm";
import { profileClient } from "../../plugins/axios/axios.provider";
import { bcryptAdapter } from "../../plugins/bcrypt/bcrypt.provider";
import { EnvAdapter } from "../../plugins/env/env.adapter";
import { jwtAdapter } from "../../plugins/jwt/jwt.provider";
import { AuthenticateCredentialUseCaseImpl } from "../application/use-cases/authenticate-credential.use-case.impl";
import { CreateCredentialUseCaseImpl } from "../application/use-cases/create-credential.use-case.impl";
import { CreateSessionUseCaseImpl } from "../application/use-cases/create-session.use-case.impl";
import { GetSessionUseCaseImpl } from "../application/use-cases/get-session.use-case.impl";
import { IssueTokenPairUseCaseImpl } from "../application/use-cases/issue-token-pair.use-case.impl";
import { ListSessionsUseCaseImpl } from "../application/use-cases/list-sessions.use-case.impl";
import { RefreshTokenPairUseCaseImpl } from "../application/use-cases/refresh-token-pair.use-case.impl";
import { RevokeSessionUseCaseImpl } from "../application/use-cases/revoke-session.use-case.impl";
import { UpdateSessionActivityUseCaseImpl } from "../application/use-cases/update-session-activity.use-case.impl";
import { SessionApplicationService } from "../application/services/session.application.service";
import { SignupApplicationService } from "../application/services/signup.application.service";
import { SessionController } from "./controllers/session.controller";
import { TypeOrmCredentialDataSource } from "./datasources/typeorm-credential.datasource";
import { TypeOrmSessionDataSource } from "./datasources/typeorm-session.datasource";
import { TypeOrmTokenDataSource } from "./datasources/typeorm-token.datasource";
import { CredentialRepositoryImpl } from "./repositories/credential.repository.impl";
import { SessionRepositoryImpl } from "./repositories/session.repository.impl";
import { TokenRepositoryImpl } from "./repositories/token.repository.impl";
import { SessionRouter } from "./routes/session.router";

export const sessionFactory = {
  createRouter(dataSource: DataSource): Router {
    const credentialDataSource = new TypeOrmCredentialDataSource(dataSource);
    const sessionDataSource = new TypeOrmSessionDataSource(dataSource);
    const tokenDataSource = new TypeOrmTokenDataSource(dataSource);

    const credentialRepository = new CredentialRepositoryImpl(credentialDataSource);
    const sessionRepository = new SessionRepositoryImpl(sessionDataSource);
    const tokenRepository = new TokenRepositoryImpl(tokenDataSource);

    const issueTokenPairUseCase = new IssueTokenPairUseCaseImpl(tokenRepository, jwtAdapter, bcryptAdapter);
    const createCredentialUseCase = new CreateCredentialUseCaseImpl(credentialRepository, bcryptAdapter);
    const authenticateCredentialUseCase = new AuthenticateCredentialUseCaseImpl(credentialRepository, bcryptAdapter);
    const createSessionUseCase = new CreateSessionUseCaseImpl(sessionRepository, issueTokenPairUseCase);
    const getSessionUseCase = new GetSessionUseCaseImpl(sessionRepository);
    const listSessionsUseCase = new ListSessionsUseCaseImpl(sessionRepository);
    const refreshTokenPairUseCase = new RefreshTokenPairUseCaseImpl(
      tokenRepository,
      sessionRepository,
      jwtAdapter,
      bcryptAdapter,
      issueTokenPairUseCase,
    );
    const revokeSessionUseCase = new RevokeSessionUseCaseImpl(sessionRepository, tokenRepository);
    const updateSessionActivityUseCase = new UpdateSessionActivityUseCaseImpl(sessionRepository);

    const sessionService = new SessionApplicationService(
      authenticateCredentialUseCase,
      createSessionUseCase,
      getSessionUseCase,
      listSessionsUseCase,
      refreshTokenPairUseCase,
      revokeSessionUseCase,
      updateSessionActivityUseCase,
    );

    const signupService = new SignupApplicationService(profileClient, createCredentialUseCase, authenticateCredentialUseCase, createSessionUseCase);

    const sessionTtlSeconds = new EnvAdapter().getInt("SESSION_TTL_SECONDS", 86400);
    const sessionController = new SessionController(sessionService, signupService, sessionTtlSeconds);

    return new SessionRouter(sessionController).getRouter();
  },
};
