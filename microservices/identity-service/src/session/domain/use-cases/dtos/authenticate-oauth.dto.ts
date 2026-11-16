import { AuthenticationTypeCode } from "../../constants/authentication-type.constants";

export interface AuthenticateOAuthInput {
  email: string;
  fullName: string;
  authenticationType: AuthenticationTypeCode;
}
