import { Consumer, Kafka, logLevel } from "kafkajs";
import { ConsumedEvent, ConsumedEventHandler, EventConsumerService } from "../../shared/domain/events/event-consumer.service";
import { MessageEnvelope } from "../../shared/domain/events/message-envelope";

export interface KafkaEventConsumerOptions {
  brokers: string[];
  clientId: string;
  groupId: string;
  topics: string[];
  fromBeginning: boolean;
  sessionTimeoutMs: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;
  enabled: boolean;
}

export class KafkaEventConsumerAdapter extends EventConsumerService {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly handlers: ConsumedEventHandler[] = [];
  private connected = false;
  private started = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;

  constructor(private readonly options: KafkaEventConsumerOptions) {
    super();

    this.kafka = new Kafka({
      clientId: options.clientId,
      brokers: options.brokers,
      logLevel: logLevel.WARN,
    });

    this.consumer = this.kafka.consumer({
      groupId: options.groupId,
      sessionTimeout: options.sessionTimeoutMs,
      allowAutoTopicCreation: true,
    });
  }

  public subscribe(handler: ConsumedEventHandler): void {
    this.handlers.push(handler);
  }

  public async start(): Promise<void> {
    if (!this.options.enabled || this.options.topics.length === 0) {
      console.log("[kafka-consumer] consumer deshabilitado o sin topics; no se suscribe a ningun topic");
      return;
    }

    this.started = true;
    await this.connectAndRun();
  }

  public async stop(): Promise<void> {
    this.started = false;

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (!this.connected) {
      return;
    }

    try {
      await this.consumer.disconnect();
    } catch (error) {
      console.warn("[kafka-consumer] error al desconectar el consumer", error);
    } finally {
      this.connected = false;
    }
  }

  private async dispatch(topic: string, raw: string | undefined): Promise<void> {
    if (raw === undefined || raw.length === 0) {
      return;
    }

    let envelope: MessageEnvelope;

    try {
      envelope = JSON.parse(raw) as MessageEnvelope;
    } catch (error) {
      console.error(`[kafka-consumer] mensaje con formato invalido en el topic "${topic}"`, error);
      return;
    }

    const event: ConsumedEvent = { topic, envelope };
    console.log("[messaging-kafka] evento recibido", event);

    for (const handler of this.handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`[kafka-consumer] error procesando el evento "${envelope.type}" del topic "${topic}"`, error);
      }
    }
  }

  private async connectAndRun(): Promise<void> {
    try {
      await this.consumer.connect();
      this.connected = true;

      for (const topic of this.options.topics) {
        await this.consumer.subscribe({ topic, fromBeginning: this.options.fromBeginning });
      }

      this.reconnectAttempts = 0;
      console.log(`[kafka-consumer] suscrito a "${this.options.topics.join(", ")}" con el grupo "${this.options.groupId}"`);

      void this.consumer
        .run({
          eachMessage: async ({ topic, message }) => {
            await this.dispatch(topic, message.value?.toString("utf8"));
          },
        })
        .catch(async (error) => {
          console.error("[kafka-consumer] el consumer se detuvo", error);
          this.connected = false;

          try {
            await this.consumer.disconnect();
          } catch {
            // Puede que el consumer ya se haya desconectado.
          }

          this.scheduleReconnect();
        });
    } catch (error) {
      console.warn("[kafka-consumer] no se pudo conectar; se reintentara", error);

      try {
        await this.consumer.disconnect();
      } catch {
        // Puede no haber una conexión activa que cerrar.
      }

      this.connected = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.started || this.reconnectTimer !== null) {
      return;
    }

    const exponentialDelay = this.options.retryBaseDelayMs * Math.pow(2, this.reconnectAttempts);
    const delay = Math.min(exponentialDelay, this.options.retryMaxDelayMs);
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connectAndRun();
    }, delay);
    this.reconnectTimer.unref();
  }
}
