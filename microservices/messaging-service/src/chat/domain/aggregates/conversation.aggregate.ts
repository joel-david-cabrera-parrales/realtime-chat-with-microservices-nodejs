import { ConversationDeletedException } from "../exceptions/conversation-deleted.exception";
import { ConversationNotParticipantException } from "../exceptions/conversation-not-participant.exception";
import { ConversationParticipantLimitReachedException } from "../exceptions/conversation-participant-limit-reached.exception";
import { ConversationTitleRequiredException } from "../exceptions/conversation-title-required.exception";
import { DirectConversationParticipantsImmutableException } from "../exceptions/direct-conversation-participants-immutable.exception";
import { DirectConversationRequiresTwoParticipantsException } from "../exceptions/direct-conversation-requires-two-participants.exception";
import { DuplicateConversationParticipantException } from "../exceptions/duplicate-conversation-participant.exception";
import { GroupConversationRequiresTwoParticipantsException } from "../exceptions/group-conversation-requires-two-participants.exception";
import { LastAdminCannotBeRemovedException } from "../exceptions/last-admin-cannot-be-removed.exception";
import { Participant } from "../entities/participant.entity";
import { ConversationCode } from "../value-objects/conversation-code.value-object";
import { ConversationTitle } from "../value-objects/conversation-title.value-object";
import { ConversationTypeValue } from "../value-objects/conversation-type.value-object";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { DirectKey } from "../value-objects/direct-key.value-object";
import { ParticipantRoleValue } from "../value-objects/participant-role.value-object";
import {
  ConversationPrimitives,
  ConversationProps,
  CreateConversationProps,
  RehydrateConversationProps,
} from "../interfaces/conversation.interface";
import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { ConversationCreatedEvent } from "../events/conversation-created.event";
import { ConversationDeletedEvent } from "../events/conversation-deleted.event";
import { ConversationRenamedEvent } from "../events/conversation-renamed.event";
import { ParticipantAddedEvent } from "../events/participant-added.event";
import { ParticipantLeftEvent } from "../events/participant-left.event";
import { ParticipantRemovedEvent } from "../events/participant-removed.event";

export const MAX_PARTICIPANTS = 256;
export const MIN_GROUP_PARTICIPANTS = 2;

export class Conversation {
  private readonly events: DomainEvent[] = [];

  private constructor(private readonly props: ConversationProps) {}

  public static create(props: CreateConversationProps): Conversation {
    const now = new Date();
    const type = ConversationTypeValue.create(props.type);
    const createdBy = CredentialCode.create(props.createdBy);

    const codes = props.participantCredentialCodes.map((code) => CredentialCode.create(code).value);

    if (new Set(codes).size !== codes.length) {
      throw new DuplicateConversationParticipantException(codes.join(","));
    }

    if (!codes.includes(createdBy.value)) {
      throw new ConversationNotParticipantException(createdBy.value);
    }

    if (codes.length > MAX_PARTICIPANTS) {
      throw new ConversationParticipantLimitReachedException(MAX_PARTICIPANTS);
    }

    if (type.isDirect()) {
      if (codes.length !== 2) {
        throw new DirectConversationRequiresTwoParticipantsException(codes.length);
      }

      const conversation = new Conversation({
        code: ConversationCode.generate(),
        type,
        title: undefined,
        directKey: DirectKey.fromParticipants(codes),
        participants: codes.map((code) => Participant.create(code, ParticipantRoleValue.member(), now)),
        createdBy,
        lastMessageAt: undefined,
        createdAt: now,
        updatedAt: now,
        deletedAt: undefined,
      });

      conversation.recordCreatedEvent(now);

      return conversation;
    }

    if (props.title === undefined || props.title.trim().length === 0) {
      throw new ConversationTitleRequiredException();
    }

    if (codes.length < MIN_GROUP_PARTICIPANTS) {
      throw new GroupConversationRequiresTwoParticipantsException(codes.length);
    }

    const conversation = new Conversation({
      code: ConversationCode.generate(),
      type,
      title: ConversationTitle.create(props.title),
      directKey: undefined,
      participants: codes.map((code) =>
        Participant.create(code, code === createdBy.value ? ParticipantRoleValue.admin() : ParticipantRoleValue.member(), now),
      ),
      createdBy,
      lastMessageAt: undefined,
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
    });

    conversation.recordCreatedEvent(now);

    return conversation;
  }

  public static rehydrate(props: RehydrateConversationProps): Conversation {
    return new Conversation({
      code: ConversationCode.create(props.code),
      type: ConversationTypeValue.create(props.type),
      title: props.title === null ? undefined : ConversationTitle.create(props.title),
      directKey: props.directKey === null ? undefined : DirectKey.create(props.directKey),
      participants: props.participants.map((participant) =>
        Participant.rehydrate(
          participant.credentialCode,
          participant.role,
          participant.status,
          participant.joinedAt,
          participant.leftAt,
        ),
      ),
      createdBy: CredentialCode.create(props.createdBy),
      lastMessageAt: props.lastMessageAt === null ? undefined : new Date(props.lastMessageAt.getTime()),
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
      deletedAt: props.deletedAt === null ? undefined : new Date(props.deletedAt.getTime()),
    });
  }

  public get code(): ConversationCode {
    return this.props.code;
  }

  public get type(): ConversationTypeValue {
    return this.props.type;
  }

  public get title(): ConversationTitle | undefined {
    return this.props.title;
  }

  public get directKey(): DirectKey | undefined {
    return this.props.directKey;
  }

  public get participants(): readonly Participant[] {
    return this.props.participants;
  }

  public get createdBy(): CredentialCode {
    return this.props.createdBy;
  }

  public get lastMessageAt(): Date | undefined {
    return this.props.lastMessageAt === undefined ? undefined : new Date(this.props.lastMessageAt.getTime());
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.props.updatedAt.getTime());
  }

  public get deletedAt(): Date | undefined {
    return this.props.deletedAt === undefined ? undefined : new Date(this.props.deletedAt.getTime());
  }

  public isDeleted(): boolean {
    return this.props.deletedAt !== undefined;
  }

  public findParticipant(credentialCode: CredentialCode): Participant | undefined {
    return this.props.participants.find((participant) => participant.credentialCode.equals(credentialCode));
  }

  public isParticipant(credentialCode: CredentialCode): boolean {
    const participant = this.findParticipant(credentialCode);

    return participant !== undefined && participant.isActive();
  }

  public hasActiveParticipants(): boolean {
    return this.props.participants.some((participant) => participant.isActive());
  }

  public addParticipant(credentialCode: string, role: ParticipantRoleValue = ParticipantRoleValue.member()): void {
    if (this.props.type.isDirect()) {
      throw new DirectConversationParticipantsImmutableException();
    }

    if (this.isDeleted()) {
      throw new ConversationDeletedException(this.props.code.value);
    }

    const code = CredentialCode.create(credentialCode);

    if (this.findParticipant(code) !== undefined) {
      throw new DuplicateConversationParticipantException(code.value);
    }

    if (this.props.participants.length >= MAX_PARTICIPANTS) {
      throw new ConversationParticipantLimitReachedException(MAX_PARTICIPANTS);
    }

    this.props.participants.push(Participant.create(code.value, role));
    this.props.updatedAt = new Date();

    this.recordEvent(
      new ParticipantAddedEvent({
        conversationCode: this.props.code.value,
        participantCredentialCode: code.value,
        role: role.value,
        occurredAt: new Date(),
      }),
    );
  }

  public removeParticipant(credentialCode: string): void {
    if (this.isDeleted()) {
      throw new ConversationDeletedException(this.props.code.value);
    }

    if (this.props.type.isDirect()) {
      throw new DirectConversationParticipantsImmutableException();
    }

    const participant = this.findParticipant(CredentialCode.create(credentialCode));

    if (participant === undefined) {
      throw new ConversationNotParticipantException(credentialCode);
    }

    if (participant.isAdmin() && this.countAdmins() <= 1) {
      throw new LastAdminCannotBeRemovedException();
    }

    participant.markLeft();
    this.props.updatedAt = new Date();

    this.recordEvent(
      new ParticipantRemovedEvent({
        conversationCode: this.props.code.value,
        participantCredentialCode: participant.credentialCode.value,
        occurredAt: new Date(),
      }),
    );
  }

  public leave(credentialCode: string): void {
    if (this.isDeleted()) {
      throw new ConversationDeletedException(this.props.code.value);
    }

    const participant = this.findParticipant(CredentialCode.create(credentialCode));

    if (participant === undefined) {
      throw new ConversationNotParticipantException(credentialCode);
    }

    if (participant.isAdmin() && this.countAdmins() <= 1) {
      throw new LastAdminCannotBeRemovedException();
    }

    participant.markLeft();
    this.props.updatedAt = new Date();

    this.recordEvent(
      new ParticipantLeftEvent({
        conversationCode: this.props.code.value,
        participantCredentialCode: participant.credentialCode.value,
        occurredAt: new Date(),
      }),
    );
  }

  public rename(title: string): void {
    if (this.isDeleted()) {
      throw new ConversationDeletedException(this.props.code.value);
    }

    if (this.props.type.isDirect()) {
      throw new DirectConversationParticipantsImmutableException();
    }

    this.props.title = ConversationTitle.create(title);
    this.props.updatedAt = new Date();

    this.recordEvent(
      new ConversationRenamedEvent({
        conversationCode: this.props.code.value,
        title: this.props.title.value,
        occurredAt: new Date(),
      }),
    );
  }

  public touchLastMessage(at: Date = new Date()): void {
    this.props.lastMessageAt = new Date(at.getTime());
    this.props.updatedAt = new Date();
  }

  public softDelete(at: Date = new Date()): void {
    if (this.isDeleted()) {
      return;
    }

    this.props.deletedAt = new Date(at.getTime());
    this.props.updatedAt = new Date();

    this.recordEvent(
      new ConversationDeletedEvent({
        conversationCode: this.props.code.value,
        occurredAt: new Date(),
      }),
    );
  }

  public hasEvents(): boolean {
    return this.events.length > 0;
  }

  public pullEvents(): DomainEvent[] {
    const pending = [...this.events];
    this.events.length = 0;
    return pending;
  }

  public equals(other: Conversation): boolean {
    return this.props.code.equals(other.code);
  }

  public toPrimitives(): ConversationPrimitives {
    return {
      code: this.props.code.value,
      type: this.props.type.value,
      title: this.props.title?.value ?? null,
      directKey: this.props.directKey?.value ?? null,
      participants: this.props.participants.map((participant) => participant.toPrimitives()),
      createdBy: this.props.createdBy.value,
      lastMessageAt: this.props.lastMessageAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      deletedAt: this.props.deletedAt?.toISOString() ?? null,
    };
  }

  private countAdmins(): number {
    return this.props.participants.filter((participant) => participant.isAdmin() && participant.isActive()).length;
  }

  private recordCreatedEvent(at: Date): void {
    this.recordEvent(
      new ConversationCreatedEvent({
        conversationCode: this.props.code.value,
        type: this.props.type.value,
        title: this.props.title?.value ?? null,
        createdBy: this.props.createdBy.value,
        participantCredentialCodes: this.props.participants.map((participant) => participant.credentialCode.value),
        occurredAt: at,
      }),
    );
  }

  private recordEvent(event: DomainEvent): void {
    this.events.push(event);
  }
}
