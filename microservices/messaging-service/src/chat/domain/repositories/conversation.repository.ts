import { Conversation } from "../aggregates/conversation.aggregate";
import { ConversationCode } from "../value-objects/conversation-code.value-object";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { DirectKey } from "../value-objects/direct-key.value-object";
import { PaginationCursor } from "../value-objects/pagination-cursor.value-object";

export abstract class ConversationRepository {
  abstract save(conversation: Conversation): Promise<void>;
  abstract findByCode(code: ConversationCode): Promise<Conversation | null>;
  abstract findByDirectKey(directKey: DirectKey): Promise<Conversation | null>;
  abstract existsByDirectKey(directKey: DirectKey): Promise<boolean>;
  abstract findByParticipant(
    credentialCode: CredentialCode,
    cursor?: PaginationCursor | undefined,
    limit?: number | undefined,
  ): Promise<Conversation[]>;
  abstract delete(code: ConversationCode): Promise<void>;
}
