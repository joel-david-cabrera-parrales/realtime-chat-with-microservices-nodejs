import { MessageEnvelope } from "./message-envelope";

export interface ConsumedEvent<TData = unknown> {
  topic: string;
  envelope: MessageEnvelope<TData>;
}

export interface ConsumedEventHandler {
  handle(event: ConsumedEvent): Promise<void>;
}

export abstract class EventConsumerService {
  public abstract subscribe(handler: ConsumedEventHandler): void;

  public abstract start(): Promise<void>;

  public abstract stop(): Promise<void>;
}
