import { randomUUID } from "node:crypto";

export interface DomainEventProps {
  aggregateId: string;
  eventId: string;
  occurredAt: Date;
}

export interface DomainEventPrimitives {
  eventName: string;
  eventId: string;
  aggregateId: string;
  occurredAt: string;
}

export abstract class DomainEvent {
  private readonly props: DomainEventProps;

  protected constructor(props: DomainEventProps) {
    this.props = {
      aggregateId: props.aggregateId,
      eventId: props.eventId,
      occurredAt: new Date(props.occurredAt.getTime()),
    };
  }

  public get eventId(): string {
    return this.props.eventId;
  }

  public get aggregateId(): string {
    return this.props.aggregateId;
  }

  public get occurredAt(): Date {
    return new Date(this.props.occurredAt.getTime());
  }

  public abstract get eventName(): string;

  public abstract toPayload(): unknown;

  public toPrimitives(): DomainEventPrimitives {
    return {
      eventName: this.eventName,
      eventId: this.props.eventId,
      aggregateId: this.props.aggregateId,
      occurredAt: this.props.occurredAt.toISOString(),
    };
  }

  protected static generateEventId(): string {
    return randomUUID();
  }
}
