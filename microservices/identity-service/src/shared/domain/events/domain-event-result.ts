import { DomainEvent } from "./domain-event";

export interface DomainEventResult<TOutput> {
  output: TOutput;
  events: DomainEvent[];
}
