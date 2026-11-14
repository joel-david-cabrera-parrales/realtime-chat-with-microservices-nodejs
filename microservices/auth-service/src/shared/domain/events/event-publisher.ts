import { DomainEvent } from "./domain-event";

export abstract class EventPublisher {
  public abstract publish(topic: string, event: DomainEvent): Promise<void>;

  public abstract isReady(): boolean;
}
