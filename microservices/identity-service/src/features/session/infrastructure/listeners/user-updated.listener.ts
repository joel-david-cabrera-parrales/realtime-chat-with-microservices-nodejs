import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { DomainEventListener } from "../../../../shared/domain/events/domain-event-listener";
import { EventPublisher } from "../../../../shared/domain/events/event-publisher";
import { USER_EVENT_NAMES } from "../../domain/constants/user-event.constants";

export class UserUpdatedListener extends DomainEventListener {
  public static readonly TOPIC = "user.updated";

  constructor(private readonly eventPublisher: EventPublisher) {
    super();
  }

  public supports(event: DomainEvent): boolean {
    return event.eventName === USER_EVENT_NAMES.updated;
  }

  public async onEvent(event: DomainEvent): Promise<void> {
    await this.eventPublisher.publish(UserUpdatedListener.TOPIC, event);
  }
}