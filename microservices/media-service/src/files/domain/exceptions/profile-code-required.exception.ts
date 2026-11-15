import { HttpException } from "../../../shared/http/http.exception";

export class ProfileCodeRequiredException extends HttpException {
  constructor() {
    super(400, 'El token o el header "x-profile-code" deben incluir el profile code', "PROFILE_CODE_REQUIRED");
  }
}
