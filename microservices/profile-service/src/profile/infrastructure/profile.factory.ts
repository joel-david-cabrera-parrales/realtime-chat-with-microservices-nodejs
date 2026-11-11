import { Router } from "express";
import { DataSource } from "typeorm";
import { CreateProfileUseCaseImpl } from "../application/use-cases/create-profile.use-case.impl";
import { DeleteProfileUseCaseImpl } from "../application/use-cases/delete-profile.use-case.impl";
import { ExistsProfileByEmailUseCaseImpl } from "../application/use-cases/exists-profile-by-email.use-case.impl";
import { ExistsProfileUseCaseImpl } from "../application/use-cases/exists-profile.use-case.impl";
import { GetProfileUseCaseImpl } from "../application/use-cases/get-profile.use-case.impl";
import { UpdateProfileUseCaseImpl } from "../application/use-cases/update-profile.use-case.impl";
import { ProfileApplicationService } from "../application/services/profile.application.service";
import { ProfileController } from "./controllers/profile.controller";
import { TypeOrmProfileDataSource } from "./datasources/typeorm-profile.datasource";
import { ProfileRepositoryImpl } from "./repositories/profile.repository.impl";
import { ProfileRouter } from "./routes/profile.router";

export const profileFactory = {
  createRouter(dataSource: DataSource): Router {
    const profileDataSource = new TypeOrmProfileDataSource(dataSource);
    const profileRepository = new ProfileRepositoryImpl(profileDataSource);

    const existsProfileByEmailUseCase = new ExistsProfileByEmailUseCaseImpl(
      profileRepository,
    );
    const createProfileUseCase = new CreateProfileUseCaseImpl(profileRepository);
    const getProfileUseCase = new GetProfileUseCaseImpl(profileRepository);
    const existsProfileUseCase = new ExistsProfileUseCaseImpl(profileRepository);
    const updateProfileUseCase = new UpdateProfileUseCaseImpl(profileRepository);
    const deleteProfileUseCase = new DeleteProfileUseCaseImpl(profileRepository);

    const profileService = new ProfileApplicationService(
      createProfileUseCase,
      getProfileUseCase,
      existsProfileUseCase,
      existsProfileByEmailUseCase,
      updateProfileUseCase,
      deleteProfileUseCase,
    );

    const profileController = new ProfileController(profileService);

    return new ProfileRouter(profileController).getRouter();
  },
};
