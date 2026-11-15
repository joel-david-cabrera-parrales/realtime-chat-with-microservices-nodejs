import { DomainEvent } from "../../shared/domain/events/domain-event";
import { DomainEventListener } from "../../shared/domain/events/domain-event-listener";
import { DomainEventPublisher } from "../../shared/domain/events/domain-event-publisher";

export class InMemoryDomainEventPublisherAdapter extends DomainEventPublisher {
  private readonly listeners: DomainEventListener[] = [];

  public subscribe(listener: DomainEventListener): void {
    this.listeners.push(listener);
  }

  public async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      for (const listener of this.listeners) {
        if (!listener.supports(event)) {
          continue;
        }

        try {
          await listener.onEvent(event);
        } catch (error) {
          console.error(`[domain-event] listener failed for "${event.eventName}"`, error);
        }
      }
    }
  }
}
