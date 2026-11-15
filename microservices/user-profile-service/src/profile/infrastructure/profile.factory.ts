import { Router } from "express";
import { DataSource } from "typeorm";
import { jwtAdapter } from "../../plugins/jwt/jwt.provider";
import { fileClient } from "../../plugins/axios/axios.provider";
import { envService } from "../../plugins/env/env.provider";
import { createValidateTokenMiddleware } from "../../shared/middlewares/validate-token.middleware";
import { CreateProfileUseCaseImpl } from "../application/use-cases/create-profile.use-case.impl";
import { DeleteProfileUseCaseImpl } from "../application/use-cases/delete-profile.use-case.impl";
import { ExistsProfileByEmailUseCaseImpl } from "../application/use-cases/exists-profile-by-email.use-case.impl";
import { ExistsProfileUseCaseImpl } from "../application/use-cases/exists-profile.use-case.impl";
import { GetProfileUseCaseImpl } from "../application/use-cases/get-profile.use-case.impl";
import { UpdateProfileUseCaseImpl } from "../application/use-cases/update-profile.use-case.impl";
import { UploadAvatarUseCaseImpl } from "../application/use-cases/upload-avatar.use-case.impl";
import { ProfileApplicationService } from "../application/services/profile.application.service";
import { ProfileController } from "./controllers/profile.controller";
import { TypeOrmProfileDataSource } from "./datasources/typeorm-profile.datasource";
import { ProfileRepositoryImpl } from "./repositories/profile.repository.impl";
import { ProfileRouter } from "./routes/profile.router";

export const profileFactory = {
  createRouter(dataSource: DataSource): Router {
    const profileDataSource = new TypeOrmProfileDataSource(dataSource);
    const profileRepository = new ProfileRepositoryImpl(profileDataSource);

    const existsProfileByEmailUseCase = new ExistsProfileByEmailUseCaseImpl(profileRepository);
    const createProfileUseCase = new CreateProfileUseCaseImpl(profileRepository);
    const getProfileUseCase = new GetProfileUseCaseImpl(profileRepository);
    const existsProfileUseCase = new ExistsProfileUseCaseImpl(profileRepository);
    const updateProfileUseCase = new UpdateProfileUseCaseImpl(profileRepository);
    const uploadAvatarUseCase = new UploadAvatarUseCaseImpl(profileRepository, fileClient);
    const deleteProfileUseCase = new DeleteProfileUseCaseImpl(profileRepository, fileClient);

    const profileService = new ProfileApplicationService(
      createProfileUseCase,
      getProfileUseCase,
      existsProfileUseCase,
      existsProfileByEmailUseCase,
      updateProfileUseCase,
      uploadAvatarUseCase,
      deleteProfileUseCase,
    );

    const profileController = new ProfileController(profileService);
    const validateToken = createValidateTokenMiddleware(jwtAdapter, envService.getOptional("INTERNAL_API_KEY"));

    return new ProfileRouter(profileController, validateToken).getRouter();
  },
};
