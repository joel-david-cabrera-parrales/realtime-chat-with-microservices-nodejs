import { DomainEvent } from "../../shared/domain/events/domain-event";
import { DomainEventListener } from "../../shared/domain/events/domain-event-listener";

export class ConsoleDomainEventListenerAdapter extends DomainEventListener {
  public supports(event: DomainEvent): boolean {
    return event instanceof DomainEvent;
  }

  public onEvent(event: DomainEvent): void {
    console.log(`[domain-event] ${event.eventName}`, {
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      occurredAt: event.occurredAt.toISOString(),
      payload: event.toPayload(),
    });
  }
}
