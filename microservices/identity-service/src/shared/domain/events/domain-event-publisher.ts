import { DomainEvent } from "./domain-event";
import { DomainEventListener } from "./domain-event-listener";

export abstract class DomainEventPublisher {
  public abstract subscribe(listener: DomainEventListener): void;

  public abstract publish(events: DomainEvent[]): Promise<void>;
}
