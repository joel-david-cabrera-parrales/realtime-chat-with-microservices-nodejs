import { ConsumedEvent } from "./event-consumer.service";

export abstract class DomainEventListener {
  public abstract supports(event: ConsumedEvent): boolean;

  public abstract onEvent(event: ConsumedEvent): Promise<void>;
}
