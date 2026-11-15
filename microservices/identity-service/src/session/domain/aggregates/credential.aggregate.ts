import { HashService } from "../../../shared/domain/hash.service";
import { CreateCredentialProps, CredentialPrimitives, CredentialProps, RehydrateCredentialProps } from "../interfaces/credential.interface";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { CredentialId } from "../value-objects/credential-id.value-object";
import { Password } from "../value-objects/password.value-object";
import { PasswordHash } from "../value-objects/password-hash.value-object";
import { ProfileCode } from "../value-objects/profile-code.value-object";
import { Username } from "../value-objects/username.value-object";

export class Credential {
  private constructor(private readonly props: CredentialProps) {}

  public static create(props: CreateCredentialProps): Credential {
    const now = new Date();

    return new Credential({
      id: CredentialId.new(),
      code: CredentialCode.generate(),
      username: Username.create(props.username),
      passwordHash: props.passwordHash === undefined ? undefined : PasswordHash.create(props.passwordHash),
      profileCode: ProfileCode.create(props.profileCode),
      isAuthenticated: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static rehydrate(props: RehydrateCredentialProps): Credential {
    return new Credential({
      id: CredentialId.create(props.credentialId),
      code: CredentialCode.create(props.credentialCode),
      username: Username.create(props.username),
      passwordHash: props.passwordHash === null ? undefined : PasswordHash.create(props.passwordHash),
      profileCode: ProfileCode.create(props.profileCode),
      isAuthenticated: props.isAuthenticated,
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
    });
  }

  public get id(): CredentialId {
    return this.props.id;
  }

  public get code(): CredentialCode {
    return this.props.code;
  }

  public get username(): Username {
    return this.props.username;
  }

  public get profileCode(): ProfileCode {
    return this.props.profileCode;
  }

  public get isAuthenticated(): boolean {
    return this.props.isAuthenticated;
  }

  public get passwordHash(): PasswordHash | undefined {
    return this.props.passwordHash;
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.props.updatedAt.getTime());
  }

  public async verifyPassword(password: Password, hashService: HashService): Promise<boolean> {
    const passwordHash = this.props.passwordHash;

    if (passwordHash === undefined) {
      return false;
    }

    return hashService.verifyHash(passwordHash.value, password.value);
  }

  public markAsAuthenticated(now: Date = new Date()): void {
    this.props.isAuthenticated = true;
    this.props.updatedAt = now;
  }

  public equals(other: Credential): boolean {
    return this.props.id.equals(other.id);
  }

  public toPrimitives(): CredentialPrimitives {
    return {
      credentialId: this.props.id.value,
      credentialCode: this.props.code.value,
      username: this.props.username.value,
      profileCode: this.props.profileCode.value,
      isAuthenticated: this.props.isAuthenticated,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
