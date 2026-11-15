import { Router } from "express";
import { DataSource } from "typeorm";
import { envService } from "../../plugins/env/env.provider";
import { jwtAdapter } from "../../plugins/jwt/jwt.provider";
import { s3Adapter } from "../../plugins/s3/s3.provider";
import { UuidCodeGeneratorService } from "../../plugins/uuid/uuid.code.generator.service";
import { createValidateTokenMiddleware } from "../../shared/middlewares/validate-token.middleware";
import { DeleteFileUseCaseImpl } from "../application/use-cases/delete-file.use-case.impl";
import { GetFileUseCaseImpl } from "../application/use-cases/get-file.use-case.impl";
import { ListFilesUseCaseImpl } from "../application/use-cases/list-files.use-case.impl";
import { UploadFileUseCaseImpl } from "../application/use-cases/upload-file.use-case.impl";
import { FileApplicationService } from "../application/services/file.application.service";
import { FilesController } from "./controllers/files.controller";
import { TypeOrmFileDataSource } from "./datasources/typeorm-file.datasource";
import { FilesRouter } from "./routes/files.router";

export const filesFactory = {
  createRouter(dataSource: DataSource): Router {
    const fileDataSource = new TypeOrmFileDataSource(dataSource);

    const uploadFileUseCase = new UploadFileUseCaseImpl(fileDataSource, s3Adapter, new UuidCodeGeneratorService());
    const getFileUseCase = new GetFileUseCaseImpl(fileDataSource);
    const listFilesUseCase = new ListFilesUseCaseImpl(fileDataSource);
    const deleteFileUseCase = new DeleteFileUseCaseImpl(fileDataSource, s3Adapter);

    const fileService = new FileApplicationService(
      uploadFileUseCase,
      getFileUseCase,
      listFilesUseCase,
      deleteFileUseCase,
      s3Adapter,
      envService.getOptional("PUBLIC_BASE_URL") ?? "http://localhost:3000",
    );

    const filesController = new FilesController(fileService);
    const validateToken = createValidateTokenMiddleware(jwtAdapter, envService.getOptional("INTERNAL_API_KEY"));

    return new FilesRouter(filesController, validateToken).getRouter();
  },
};
