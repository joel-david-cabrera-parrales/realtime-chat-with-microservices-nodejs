import { Participant } from "../entities/participant.entity";
import { ConversationCode } from "../value-objects/conversation-code.value-object";
import { ConversationTitle } from "../value-objects/conversation-title.value-object";
import { ConversationTypeValue } from "../value-objects/conversation-type.value-object";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { DirectKey } from "../value-objects/direct-key.value-object";
import { ParticipantRoleValue } from "../value-objects/participant-role.value-object";
import { ParticipantStatusValue } from "../value-objects/participant-status.value-object";

export interface ParticipantProps {
  credentialCode: CredentialCode;
  role: ParticipantRoleValue;
  status: ParticipantStatusValue;
  joinedAt: Date;
  leftAt: Date | undefined;
}

export interface ParticipantPrimitives {
  credentialCode: string;
  role: string;
  status: string;
  joinedAt: string;
  leftAt: string | null;
}

export interface ConversationProps {
  code: ConversationCode;
  type: ConversationTypeValue;
  title: ConversationTitle | undefined;
  directKey: DirectKey | undefined;
  participants: Participant[];
  createdBy: CredentialCode;
  lastMessageAt: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | undefined;
}

export interface CreateConversationProps {
  type: string;
  title?: string | undefined;
  participantCredentialCodes: string[];
  createdBy: string;
}

export interface RehydrateConversationProps {
  code: string;
  type: string;
  title: string | null;
  directKey: string | null;
  participants: {
    credentialCode: string;
    role: string;
    status: string;
    joinedAt: Date;
    leftAt: Date | null;
  }[];
  createdBy: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ConversationPrimitives {
  code: string;
  type: string;
  title: string | null;
  directKey: string | null;
  participants: ParticipantPrimitives[];
  createdBy: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
