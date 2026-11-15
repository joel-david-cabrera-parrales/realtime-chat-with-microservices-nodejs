import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { DomainEventListener } from "../../../shared/domain/events/domain-event-listener";
import { EventPublisher } from "../../../shared/domain/events/event-publisher";
import { SESSION_EVENT_NAMES } from "../../domain/constants/session-event.constants";

export class SessionCreatedListener extends DomainEventListener {
  public static readonly TOPIC = "session.created";

  constructor(private readonly eventPublisher: EventPublisher) {
    super();
  }

  public supports(event: DomainEvent): boolean {
    return event.eventName === SESSION_EVENT_NAMES.created;
  }

  public async onEvent(event: DomainEvent): Promise<void> {
    await this.eventPublisher.publish(SessionCreatedListener.TOPIC, event);
  }
}
