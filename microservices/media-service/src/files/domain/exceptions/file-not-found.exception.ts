import { HttpException } from "../../../shared/http/http.exception";

export class FileNotFoundException extends HttpException {
  constructor(fileCode: string) {
    super(404, `No se encontró el archivo con code "${fileCode}"`, "FILE_NOT_FOUND");
  }
}
