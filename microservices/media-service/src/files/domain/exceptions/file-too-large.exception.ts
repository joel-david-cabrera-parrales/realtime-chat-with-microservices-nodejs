import { HttpException } from "../../../shared/http/http.exception";

export class FileTooLargeException extends HttpException {
  constructor(maxSizeBytes: number) {
    super(413, `El archivo supera el tamaño máximo permitido de ${maxSizeBytes} bytes`, "FILE_TOO_LARGE");
  }
}
