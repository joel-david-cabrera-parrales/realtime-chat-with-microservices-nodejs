import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { DomainEventListener } from "../../../../shared/domain/events/domain-event-listener";
import { EventPublisher } from "../../../../shared/domain/events/event-publisher";
import { CREDENTIAL_EVENT_NAMES } from "../../domain/constants/credential-event.constants";

export class CredentialUpdatedListener extends DomainEventListener {
  public static readonly TOPIC = "credential.updated";

  constructor(private readonly eventPublisher: EventPublisher) {
    super();
  }

  public supports(event: DomainEvent): boolean {
    return event.eventName === CREDENTIAL_EVENT_NAMES.updated;
  }

  public async onEvent(event: DomainEvent): Promise<void> {
    await this.eventPublisher.publish(CredentialUpdatedListener.TOPIC, event);
  }
}
