import { ParticipantPrimitives, ParticipantProps } from "../interfaces/conversation.interface";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { ParticipantRoleValue } from "../value-objects/participant-role.value-object";
import { ParticipantStatusValue } from "../value-objects/participant-status.value-object";

export class Participant {
  private constructor(private readonly props: ParticipantProps) {}

  public static create(credentialCode: string, role: ParticipantRoleValue, joinedAt: Date = new Date()): Participant {
    return new Participant({
      credentialCode: CredentialCode.create(credentialCode),
      role,
      status: ParticipantStatusValue.active(),
      joinedAt: new Date(joinedAt.getTime()),
      leftAt: undefined,
    });
  }

  public static rehydrate(credentialCode: string, role: string, status: string, joinedAt: Date, leftAt: Date | null): Participant {
    return new Participant({
      credentialCode: CredentialCode.create(credentialCode),
      role: ParticipantRoleValue.create(role),
      status: ParticipantStatusValue.create(status),
      joinedAt: new Date(joinedAt.getTime()),
      leftAt: leftAt === null ? undefined : new Date(leftAt.getTime()),
    });
  }

  public get credentialCode(): CredentialCode {
    return this.props.credentialCode;
  }

  public get role(): ParticipantRoleValue {
    return this.props.role;
  }

  public get status(): ParticipantStatusValue {
    return this.props.status;
  }

  public get joinedAt(): Date {
    return new Date(this.props.joinedAt.getTime());
  }

  public get leftAt(): Date | undefined {
    return this.props.leftAt === undefined ? undefined : new Date(this.props.leftAt.getTime());
  }

  public isActive(): boolean {
    return this.props.status.isActive();
  }

  public isAdmin(): boolean {
    return this.props.role.isAdmin();
  }

  public markLeft(at: Date = new Date()): void {
    if (!this.isActive()) {
      return;
    }

    this.props.status = ParticipantStatusValue.left();
    this.props.leftAt = new Date(at.getTime());
  }

  public equals(other: Participant): boolean {
    return this.props.credentialCode.equals(other.credentialCode);
  }

  public toPrimitives(): ParticipantPrimitives {
    return {
      credentialCode: this.props.credentialCode.value,
      role: this.props.role.value,
      status: this.props.status.value,
      joinedAt: this.props.joinedAt.toISOString(),
      leftAt: this.props.leftAt?.toISOString() ?? null,
    };
  }
}
