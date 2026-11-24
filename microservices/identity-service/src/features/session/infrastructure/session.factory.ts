import { Router } from "express";
import passport from "passport";
import { DataSource } from "typeorm";
import { bcryptAdapter } from "../../../plugins/bcrypt/bcrypt.provider";
import { EnvAdapter } from "../../../plugins/env/env.adapter";
import { domainEventPublisher } from "../../../plugins/events/events.provider";
import { jwtAdapter } from "../../../plugins/jwt/jwt.provider";
import { kafkaEventPublisher } from "../../../plugins/kafka/kafka.provider";
import { fileClient } from "../../../plugins/axios/file.client.provider";
import { TypeOrmUnitOfWork } from "../../../shared/infrastructure/persistence/typeorm-unit-of-work";
import { ProfileApplicationService } from "../../profile/application/services";
import {
  CreateProfileUseCaseImpl,
  DeleteProfileUseCaseImpl,
  ExistsProfileByEmailUseCaseImpl,
  ExistsProfileUseCaseImpl,
  GetProfileUseCaseImpl,
  ListProfilesUseCaseImpl,
  UpdateProfileUseCaseImpl,
  UploadAvatarUseCaseImpl,
} from "../../profile/application/use-cases";
import { TypeOrmProfileDataSource } from "../../profile/infrastructure/datasources/typeorm-profile.datasource";
import { ProfileRepositoryImpl } from "../../profile/infrastructure/repositories/profile.repository.impl";
import { OAuthPassportProvider } from "./oauth/passport-oauth.provider";
import { CredentialRepositoryImpl } from "./repositories/credential.repository.impl";
import { SessionRepositoryImpl } from "./repositories/session.repository.impl";
import { TokenRepositoryImpl } from "./repositories/token.repository.impl";
import { createValidateTokenMiddleware } from "../../../shared/middlewares/validate-token.middleware";
import { OAuthApplicationService } from "../application/services/oauth.application.service";
import { SessionApplicationService } from "../application/services/session.application.service";
import { SignupApplicationService } from "../application/services/signup.application.service";
import { AuthenticateCredentialUseCaseImpl } from "../application/use-cases/authenticate-credential.use-case.impl";
import { AuthenticateOAuthUseCaseImpl } from "../application/use-cases/authenticate-oauth.use-case.impl";
import { CreateCredentialUseCaseImpl } from "../application/use-cases/create-credential.use-case.impl";
import { CreateSessionUseCaseImpl } from "../application/use-cases/create-session.use-case.impl";
import { GetSessionUseCaseImpl } from "../application/use-cases/get-session.use-case.impl";
import { IssueTokenPairUseCaseImpl } from "../application/use-cases/issue-token-pair.use-case.impl";
import { ListSessionsUseCaseImpl } from "../application/use-cases/list-sessions.use-case.impl";
import { RefreshTokenPairUseCaseImpl } from "../application/use-cases/refresh-token-pair.use-case.impl";
import { RevokeSessionUseCaseImpl } from "../application/use-cases/revoke-session.use-case.impl";
import { UpdateSessionActivityUseCaseImpl } from "../application/use-cases/update-session-activity.use-case.impl";
import { OAuthController } from "./controllers/oauth.controller";
import { SessionController } from "./controllers/session.controller";
import { TypeOrmCredentialDataSource } from "./datasources/typeorm-credential.datasource";
import { TypeOrmSessionDataSource } from "./datasources/typeorm-session.datasource";
import { TypeOrmTokenDataSource } from "./datasources/typeorm-token.datasource";
import { registerSessionListeners } from "./listeners/session-listeners.provider";
import { OAuthRouter } from "./routes/oauth.router";
import { SessionRouter } from "./routes/session.router";

export const sessionFactory = {
  createRouter(dataSource: DataSource): Router {
    registerSessionListeners(kafkaEventPublisher);
    const unitOfWork = new TypeOrmUnitOfWork(dataSource);

    const credentialDataSource = new TypeOrmCredentialDataSource(dataSource);
    const sessionDataSource = new TypeOrmSessionDataSource(dataSource);
    const tokenDataSource = new TypeOrmTokenDataSource(dataSource);
    const profileDataSource = new TypeOrmProfileDataSource(dataSource);

    const credentialRepository = new CredentialRepositoryImpl(credentialDataSource);
    const sessionRepository = new SessionRepositoryImpl(sessionDataSource);
    const tokenRepository = new TokenRepositoryImpl(tokenDataSource);
    const profileRepository = new ProfileRepositoryImpl(profileDataSource);

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

    const profileApplicationService = new ProfileApplicationService(
      new CreateProfileUseCaseImpl(profileRepository),
      new GetProfileUseCaseImpl(profileRepository),
      new ExistsProfileUseCaseImpl(profileRepository),
      new ExistsProfileByEmailUseCaseImpl(profileRepository),
      new UpdateProfileUseCaseImpl(profileRepository),
      new DeleteProfileUseCaseImpl(profileRepository),
      new ListProfilesUseCaseImpl(profileRepository),
      unitOfWork,
      new UploadAvatarUseCaseImpl(profileRepository, fileClient),
      fileClient,
      domainEventPublisher,
      credentialRepository,
    );

    const sessionService = new SessionApplicationService(
      authenticateCredentialUseCase,
      createSessionUseCase,
      getSessionUseCase,
      listSessionsUseCase,
      refreshTokenPairUseCase,
      revokeSessionUseCase,
      updateSessionActivityUseCase,
      domainEventPublisher,
      credentialRepository,
      unitOfWork,
    );

    const signupService = new SignupApplicationService(
      profileApplicationService,
      createCredentialUseCase,
      authenticateCredentialUseCase,
      createSessionUseCase,
      domainEventPublisher,
      unitOfWork,
    );

    const sessionTtlSeconds = new EnvAdapter().getInt("SESSION_TTL_SECONDS", 86400);
    const sessionController = new SessionController(sessionService, signupService, sessionTtlSeconds);
    const validateToken = createValidateTokenMiddleware(jwtAdapter);

    return new SessionRouter(sessionController, validateToken).getRouter();
  },

  createOAuthRouter(dataSource: DataSource): Router {
    const unitOfWork = new TypeOrmUnitOfWork(dataSource);
    const credentialDataSource = new TypeOrmCredentialDataSource(dataSource);
    const sessionDataSource = new TypeOrmSessionDataSource(dataSource);
    const tokenDataSource = new TypeOrmTokenDataSource(dataSource);
    const profileDataSource = new TypeOrmProfileDataSource(dataSource);

    const credentialRepository = new CredentialRepositoryImpl(credentialDataSource);
    const sessionRepository = new SessionRepositoryImpl(sessionDataSource);
    const tokenRepository = new TokenRepositoryImpl(tokenDataSource);
    const profileRepository = new ProfileRepositoryImpl(profileDataSource);

    const issueTokenPairUseCase = new IssueTokenPairUseCaseImpl(tokenRepository, jwtAdapter, bcryptAdapter);
    const createSessionUseCase = new CreateSessionUseCaseImpl(sessionRepository, issueTokenPairUseCase);
    const profileApplicationService = new ProfileApplicationService(
      new CreateProfileUseCaseImpl(profileRepository),
      new GetProfileUseCaseImpl(profileRepository),
      new ExistsProfileUseCaseImpl(profileRepository),
      new ExistsProfileByEmailUseCaseImpl(profileRepository),
      new UpdateProfileUseCaseImpl(profileRepository),
      new DeleteProfileUseCaseImpl(profileRepository),
      new ListProfilesUseCaseImpl(profileRepository),
      unitOfWork,
      new UploadAvatarUseCaseImpl(profileRepository, fileClient),
      fileClient,
      domainEventPublisher,
      credentialRepository,
    );
    const authenticateOAuthUseCase = new AuthenticateOAuthUseCaseImpl(credentialRepository, profileApplicationService);

    const oauthService = new OAuthApplicationService(authenticateOAuthUseCase, createSessionUseCase, domainEventPublisher, unitOfWork);
    const passportProvider = new OAuthPassportProvider(passport);
    const sessionTtlSeconds = new EnvAdapter().getInt("SESSION_TTL_SECONDS", 86400);
    const oauthController = new OAuthController(oauthService, passportProvider, sessionTtlSeconds);

    return new OAuthRouter(oauthController).getRouter();
  },
};
