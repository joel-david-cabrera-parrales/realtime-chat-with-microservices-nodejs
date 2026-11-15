import { DomainEvent } from "./domain-event";

export abstract class DomainEventListener {
  public abstract supports(event: DomainEvent): boolean;

  public abstract onEvent(event: DomainEvent): void | Promise<void>;
}
