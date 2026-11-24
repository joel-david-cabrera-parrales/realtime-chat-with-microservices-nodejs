import { AuthenticationTypeCode } from "../../domain/constants/authentication-type.constants";

export interface OAuthPrincipal {
  email: string;
  fullName: string;
  authenticationType: AuthenticationTypeCode;
}
