import { Router } from "express";
import { DataSource } from "typeorm";
import { jwtAdapter } from "../../../plugins/jwt/jwt.provider";
import { fileClient } from "../../../plugins/axios/file.client.provider";
import { EnvAdapter } from "../../../plugins/env/env.adapter";
import { domainEventPublisher } from "../../../plugins/events/events.provider";
import { createValidateTokenMiddleware } from "../../../shared/middlewares/validate-token.middleware";
import { TypeOrmUnitOfWork } from "../../../shared/infrastructure/persistence/typeorm-unit-of-work";
import { ProfileApplicationService } from "../application/services/profile.application.service";
import {
  CreateProfileUseCaseImpl,
  DeleteProfileUseCaseImpl,
  ExistsProfileByEmailUseCaseImpl,
  ExistsProfileUseCaseImpl,
  GetProfileUseCaseImpl,
  ListProfilesUseCaseImpl,
  UpdateProfileUseCaseImpl,
  UploadAvatarUseCaseImpl,
} from "../application/use-cases";
import { TypeOrmProfileDataSource } from "./datasources/typeorm-profile.datasource";
import { ProfileController } from "./controllers/profile.controller";
import { ProfileRepositoryImpl } from "./repositories/profile.repository.impl";
import { TypeOrmCredentialDataSource } from "../../session/infrastructure/datasources/typeorm-credential.datasource";
import { CredentialRepositoryImpl } from "../../session/infrastructure/repositories/credential.repository.impl";
import { ProfileRouter } from "./routes/profile.router";

export const profileFactory = {
  createRouter(dataSource: DataSource): Router {
    const unitOfWork = new TypeOrmUnitOfWork(dataSource);
    const profileDataSource = new TypeOrmProfileDataSource(dataSource);
    const profileRepository = new ProfileRepositoryImpl(profileDataSource);
    const credentialDataSource = new TypeOrmCredentialDataSource(dataSource);
    const credentialRepository = new CredentialRepositoryImpl(credentialDataSource);

    const profileService = new ProfileApplicationService(
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
    const controller = new ProfileController(profileService);
    const validateToken = createValidateTokenMiddleware(jwtAdapter, new EnvAdapter().getOptional("INTERNAL_API_KEY"));

    return new ProfileRouter(controller, validateToken).getRouter();
  },
};
