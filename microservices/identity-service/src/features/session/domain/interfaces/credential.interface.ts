import { AuthenticationTypeCode } from "../constants/authentication-type.constants";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { CredentialId } from "../value-objects/credential-id.value-object";
import { PasswordHash } from "../value-objects/password-hash.value-object";
import { ProfileCode } from "../value-objects/profile-code.value-object";
import { Username } from "../value-objects/username.value-object";

export interface CredentialProps {
  id: CredentialId;
  code: CredentialCode;
  username: Username;
  passwordHash: PasswordHash | undefined;
  profileCode: ProfileCode;
  authenticationType: AuthenticationTypeCode;
  isAuthenticated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCredentialProps {
  username: string;
  passwordHash?: string | undefined;
  profileCode: string;
  authenticationType?: AuthenticationTypeCode;
}

export interface RehydrateCredentialProps {
  credentialId: number;
  credentialCode: string;
  username: string;
  passwordHash: string | null;
  profileCode: string;
  authenticationType?: AuthenticationTypeCode;
  isAuthenticated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CredentialPrimitives {
  credentialId: number;
  credentialCode: string;
  username: string;
  profileCode: string;
  authenticationType: AuthenticationTypeCode;
  isAuthenticated: boolean;
  createdAt: string;
  updatedAt: string;
}
