import { Kafka, logLevel, Partitioners, Producer } from "kafkajs";
import { DomainEvent } from "../../shared/domain/events/domain-event";
import { EventPublisher } from "../../shared/domain/events/event-publisher";
import { MessageEnvelope } from "../../shared/domain/events/message-envelope";

export interface KafkaEventPublisherOptions {
  brokers: string[];
  clientId: string;
  source: string;
  topicPrefix: string;
  connectTimeoutMs: number;
  requestTimeoutMs: number;
  bufferMax: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;
  enabled: boolean;
}

interface BufferedMessage {
  topic: string;
  key: string;
  value: string;
}

export class KafkaEventPublisherAdapter extends EventPublisher {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly buffer: BufferedMessage[] = [];
  private connected = false;
  private connecting: Promise<void> | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private shuttingDown = false;

  constructor(private readonly options: KafkaEventPublisherOptions) {
    super();

    this.kafka = new Kafka({
      clientId: options.clientId,
      brokers: options.brokers,
      connectionTimeout: options.connectTimeoutMs,
      requestTimeout: options.requestTimeoutMs,
      logLevel: logLevel.WARN,
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      idempotent: true,
      maxInFlightRequests: 1,
      createPartitioner: Partitioners.DefaultPartitioner,
    });
  }

  public async publish(topic: string, event: DomainEvent): Promise<void> {
    if (!this.options.enabled) {
      return;
    }

    const message = this.buildMessage(topic, event);

    try {
      await this.ensureConnected();
      await this.send(message);
    } catch (error) {
      this.enqueue(message, error);
      this.scheduleReconnect();
    }
  }

  public isReady(): boolean {
    return this.options.enabled && this.connected;
  }

  public async connect(): Promise<void> {
    if (!this.options.enabled) {
      return;
    }

    try {
      await this.ensureConnected();
    } catch (error) {
      console.warn("[kafka] no se pudo conectar con el broker; los eventos quedaran en buffer", error);
      this.scheduleReconnect();
    }
  }

  public async disconnect(): Promise<void> {
    this.shuttingDown = true;

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (!this.connected) {
      return;
    }

    try {
      await this.producer.disconnect();
    } catch (error) {
      console.warn("[kafka] error al desconectar el producer", error);
    } finally {
      this.connected = false;
    }
  }

  private buildMessage(topic: string, event: DomainEvent): BufferedMessage {
    const envelope: MessageEnvelope = {
      specversion: "1.0",
      id: event.eventId,
      type: event.eventName,
      source: this.options.source,
      subject: event.aggregateId,
      time: event.occurredAt.toISOString(),
      datacontenttype: "application/json",
      data: event.toPayload(),
    };

    return {
      topic: this.resolveTopic(topic),
      key: event.aggregateId,
      value: JSON.stringify(envelope),
    };
  }

  private resolveTopic(topic: string): string {
    const prefix = this.options.topicPrefix.replace(/\.+$/, "");

    return prefix.length === 0 ? topic : `${prefix}.${topic}`;
  }

  private async ensureConnected(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (this.connecting !== null) {
      return this.connecting;
    }

    this.connecting = this.producer
      .connect()
      .then(() => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log(`[kafka] producer conectado a ${this.options.brokers.join(",")}`);
      })
      .finally(() => {
        this.connecting = null;
      });

    await this.connecting;
  }

  private async send(message: BufferedMessage): Promise<void> {
    await this.producer.send({
      topic: message.topic,
      messages: [{ key: message.key, value: message.value }],
    });

    console.log("[auth-kafka] evento publicado", {
      topic: message.topic,
      key: message.key,
      envelope: JSON.parse(message.value) as MessageEnvelope,
    });
  }

  private enqueue(message: BufferedMessage, error: unknown): void {
    if (this.buffer.length >= this.options.bufferMax) {
      const discarded = this.buffer.shift();
      console.warn(`[kafka] buffer lleno (${this.options.bufferMax}); se descarta el mensaje en cola de "${discarded?.topic ?? "desconocido"}"`);
    }

    this.buffer.push(message);
    console.warn(
      `[kafka] no se pudo publicar en "${message.topic}"; mensaje almacenado en buffer (${this.buffer.length}/${this.options.bufferMax})`,
      { envelope: JSON.parse(message.value) as MessageEnvelope },
      error,
    );
  }

  private scheduleReconnect(): void {
    if (this.shuttingDown || !this.options.enabled || this.reconnectTimer !== null) {
      return;
    }

    const delay = this.computeReconnectDelay();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.reconnect();
    }, delay);
    this.reconnectTimer.unref();
  }

  private computeReconnectDelay(): number {
    const exponential = this.options.retryBaseDelayMs * Math.pow(2, this.reconnectAttempts);
    const capped = Math.min(exponential, this.options.retryMaxDelayMs);
    const jitter = Math.floor(Math.random() * this.options.retryBaseDelayMs);
    this.reconnectAttempts += 1;

    return capped + jitter;
  }

  private async reconnect(): Promise<void> {
    try {
      await this.ensureConnected();
      await this.flushBuffer();
    } catch (error) {
      console.warn("[kafka] fallo al reconectar con el broker; se reintentara", error);
      this.scheduleReconnect();
    }
  }

  private async flushBuffer(): Promise<void> {
    while (this.buffer.length > 0) {
      const message = this.buffer.shift();

      if (message === undefined) {
        return;
      }

      try {
        await this.send(message);
      } catch (error) {
        this.buffer.unshift(message);
        console.warn(`[kafka] no se pudo vaciar el buffer; quedan ${this.buffer.length} mensajes pendientes`, error);
        this.scheduleReconnect();
        return;
      }
    }

    if (this.buffer.length === 0) {
      console.log("[kafka] buffer vaciado");
    }
  }
}
