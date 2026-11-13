import { HttpException } from "../../../shared/http/http.exception";

export class FileAccessDeniedException extends HttpException {
  constructor() {
    super(403, "No tiene permisos para acceder a este archivo", "FILE_ACCESS_DENIED");
  }
}
