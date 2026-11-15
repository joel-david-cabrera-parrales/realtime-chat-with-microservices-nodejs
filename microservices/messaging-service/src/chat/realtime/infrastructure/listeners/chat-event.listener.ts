import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { DomainEventListener } from "../../../../shared/domain/events/domain-event-listener";
import { ConversationCreatedEvent } from "../../../domain/events/conversation-created.event";
import { ConversationDeletedEvent } from "../../../domain/events/conversation-deleted.event";
import { ConversationRenamedEvent } from "../../../domain/events/conversation-renamed.event";
import { MessageCreatedEvent } from "../../../domain/events/message-created.event";
import { MessageDeletedEvent } from "../../../domain/events/message-deleted.event";
import { MessageDeliveredEvent } from "../../../domain/events/message-delivered.event";
import { MessageReadEvent } from "../../../domain/events/message-read.event";
import { MessageUpdatedEvent } from "../../../domain/events/message-updated.event";
import { ParticipantAddedEvent } from "../../../domain/events/participant-added.event";
import { ParticipantLeftEvent } from "../../../domain/events/participant-left.event";
import { ParticipantRemovedEvent } from "../../../domain/events/participant-removed.event";
import { RealtimePublisher } from "../../domain/realtime-publisher";

export class ChatEventListener extends DomainEventListener {
  constructor(private readonly realtimePublisher: RealtimePublisher) {
    super();
  }

  public supports(event: DomainEvent): boolean {
    return (
      event instanceof MessageCreatedEvent ||
      event instanceof MessageUpdatedEvent ||
      event instanceof MessageDeletedEvent ||
      event instanceof MessageDeliveredEvent ||
      event instanceof MessageReadEvent ||
      event instanceof ConversationCreatedEvent ||
      event instanceof ConversationRenamedEvent ||
      event instanceof ConversationDeletedEvent ||
      event instanceof ParticipantAddedEvent ||
      event instanceof ParticipantRemovedEvent ||
      event instanceof ParticipantLeftEvent
    );
  }

  public onEvent(event: DomainEvent): void {
    if (event instanceof ConversationCreatedEvent) {
      for (const participantCredentialCode of event.toPayload().participantCredentialCodes) {
        this.realtimePublisher.joinUserToConversation(participantCredentialCode, event.conversationCode);
      }

      this.realtimePublisher.publishToConversation(event.conversationCode, event.eventName, event.toPayload());
      return;
    }

    if (event instanceof ParticipantAddedEvent) {
      const payload = event.toPayload();

      this.realtimePublisher.joinUserToConversation(payload.participantCredentialCode, event.conversationCode);
      this.realtimePublisher.publishToConversation(event.conversationCode, event.eventName, payload);
      return;
    }

    if (event instanceof ParticipantRemovedEvent || event instanceof ParticipantLeftEvent) {
      const payload = event.toPayload();

      this.realtimePublisher.publishToConversation(event.conversationCode, event.eventName, payload);
      this.realtimePublisher.removeUserFromConversation(payload.participantCredentialCode, event.conversationCode);
      return;
    }

    if (event instanceof ConversationDeletedEvent) {
      this.realtimePublisher.publishToConversation(event.conversationCode, event.eventName, event.toPayload());
      return;
    }

    if (
      event instanceof MessageCreatedEvent ||
      event instanceof MessageUpdatedEvent ||
      event instanceof MessageDeletedEvent ||
      event instanceof MessageDeliveredEvent ||
      event instanceof MessageReadEvent ||
      event instanceof ConversationRenamedEvent
    ) {
      this.realtimePublisher.publishToConversation(event.conversationCode, event.eventName, event.toPayload());
    }
  }
}
