import dotenv from "dotenv";
import { EnvAdapter } from "../env/env.adapter";
import { KafkaEventPublisherAdapter } from "./kafka-event-publisher.adapter";

dotenv.config();

const env = new EnvAdapter();

const parseBrokers = (value: string): string[] =>
  value
    .split(",")
    .map((broker) => broker.trim())
    .filter((broker) => broker.length > 0);

export const kafkaEventPublisher = new KafkaEventPublisherAdapter({
  brokers: parseBrokers(env.getString("KAFKA_BROKERS", "kafka:29092")),
  clientId: env.getString("KAFKA_CLIENT_ID", "identity-service"),
  source: env.getString("KAFKA_SOURCE", "identity-service"),
  topicPrefix: env.getString("KAFKA_TOPIC_PREFIX", "chat.auth"),
  connectTimeoutMs: env.getInt("KAFKA_CONNECT_TIMEOUT_MS", 5000),
  requestTimeoutMs: env.getInt("KAFKA_REQUEST_TIMEOUT_MS", 10000),
  bufferMax: env.getInt("KAFKA_BUFFER_MAX", 1000),
  retryBaseDelayMs: env.getInt("KAFKA_RETRY_BASE_DELAY_MS", 1000),
  retryMaxDelayMs: env.getInt("KAFKA_RETRY_MAX_DELAY_MS", 30000),
  enabled: env.getBool("KAFKA_ENABLED", true),
});
