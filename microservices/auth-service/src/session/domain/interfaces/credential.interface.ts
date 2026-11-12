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
  isAuthenticated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCredentialProps {
  credentialId: number;
  username: string;
  passwordHash?: string | undefined;
  profileCode: string;
}

export interface RehydrateCredentialProps {
  credentialId: number;
  credentialCode: string;
  username: string;
  passwordHash: string | null;
  profileCode: string;
  isAuthenticated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CredentialPrimitives {
  credentialId: number;
  credentialCode: string;
  username: string;
  profileCode: string;
  isAuthenticated: boolean;
  createdAt: string;
  updatedAt: string;
}
