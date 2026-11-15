import { Conversation } from "../aggregates/conversation.aggregate";
import { Message } from "../aggregates/message.aggregate";
import { ConversationDeletedException } from "../exceptions/conversation-deleted.exception";
import { ConversationNotAdminException } from "../exceptions/conversation-not-admin.exception";
import { ConversationNotParticipantException } from "../exceptions/conversation-not-participant.exception";
import { MessageNotEditableException } from "../exceptions/message-not-editable.exception";
import { CredentialCode } from "../value-objects/credential-code.value-object";

export class ChatAccessPolicy {
  public assertCanSend(conversation: Conversation, actor: CredentialCode): void {
    this.assertConversationIsUsable(conversation);

    if (!conversation.isParticipant(actor)) {
      throw new ConversationNotParticipantException(actor.value);
    }
  }

  public assertCanEdit(message: Message, conversation: Conversation, actor: CredentialCode): void {
    this.assertConversationIsUsable(conversation);

    if (!message.senderCredentialCode.equals(actor)) {
      throw new MessageNotEditableException();
    }
  }

  public assertCanDelete(message: Message, conversation: Conversation, actor: CredentialCode): void {
    this.assertConversationIsUsable(conversation);

    if (message.senderCredentialCode.equals(actor)) {
      return;
    }

    const participant = conversation.findParticipant(actor);

    if (participant === undefined || !participant.isActive() || !participant.isAdmin()) {
      throw new ConversationNotAdminException(actor.value);
    }
  }

  public assertCanManageParticipants(conversation: Conversation, actor: CredentialCode): void {
    this.assertConversationIsUsable(conversation);

    if (!conversation.type.isGroup()) {
      throw new ConversationNotAdminException(actor.value);
    }

    const participant = conversation.findParticipant(actor);

    if (participant === undefined || !participant.isActive() || !participant.isAdmin()) {
      throw new ConversationNotAdminException(actor.value);
    }
  }

  public assertIsParticipant(conversation: Conversation, actor: CredentialCode): void {
    if (!conversation.isParticipant(actor)) {
      throw new ConversationNotParticipantException(actor.value);
    }
  }

  private assertConversationIsUsable(conversation: Conversation): void {
    if (conversation.isDeleted()) {
      throw new ConversationDeletedException(conversation.code.value);
    }
  }
}
