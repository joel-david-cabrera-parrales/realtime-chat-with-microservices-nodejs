import { HttpException } from "../../../shared/http/http.exception";

export class InvalidFileTypeException extends HttpException {
  constructor(mimeType: string, allowed: string[]) {
    super(415, `El tipo de archivo "${mimeType}" no está permitido. Permitidos: ${allowed.join(", ")}`, "FILE_TYPE_NOT_ALLOWED");
  }
}
