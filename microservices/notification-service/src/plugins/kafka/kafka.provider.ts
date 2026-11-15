import { envService } from "../env/env.provider";
import { KafkaEventConsumerAdapter } from "./kafka-event-consumer.adapter";

const parseList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export const eventConsumer = new KafkaEventConsumerAdapter({
  brokers: parseList(envService.getString("KAFKA_BROKERS", "kafka:29092")),
  clientId: envService.getString("KAFKA_CLIENT_ID", "notification-service"),
  groupId: envService.getString("KAFKA_GROUP_ID", "notification-service"),
  topics: parseList(envService.getString("KAFKA_TOPICS", "chat.auth.session.created,chat.auth.session.revoked")),
  fromBeginning: envService.getBool("KAFKA_FROM_BEGINNING", false),
  sessionTimeoutMs: envService.getInt("KAFKA_SESSION_TIMEOUT_MS", 30000),
  retryBaseDelayMs: envService.getInt("KAFKA_RETRY_BASE_DELAY_MS", 1000),
  retryMaxDelayMs: envService.getInt("KAFKA_RETRY_MAX_DELAY_MS", 30000),
  enabled: envService.getBool("KAFKA_ENABLED", true),
});
