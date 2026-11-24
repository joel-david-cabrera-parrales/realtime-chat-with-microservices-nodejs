import { DataSource } from "typeorm";
import { emailService } from "../../plugins/email/email.provider";
import { DomainEventListener } from "../../shared/domain/events/domain-event-listener";
import { EventConsumerService, ConsumedEvent } from "../../shared/domain/events/event-consumer.service";
import { SendSessionRevokedEmailUseCaseImpl } from "../application/use-cases/send-session-revoked-email.use-case.impl";
import { SendSessionStartedEmailUseCaseImpl } from "../application/use-cases/send-session-started-email.use-case.impl";
import { SessionRevokedListener } from "./listeners/session-revoked.listener";
import { SessionStartedListener } from "./listeners/session-started.listener";
import { CredentialCreatedListener } from "./listeners/credential-created.listener";
import { CredentialUpdatedListener } from "./listeners/credential-updated.listener";
import { CredentialDeletedListener } from "./listeners/credential-deleted.listener";
import { TypeOrmUserCredentialDataSource } from "./datasources/typeorm-user-credential.datasource";

export const notificationFactory = {
  registerListeners(eventConsumer: EventConsumerService, dataSource: DataSource): void {
    const userCredentialDataSource = new TypeOrmUserCredentialDataSource(dataSource);

    const sendSessionStartedEmail = new SendSessionStartedEmailUseCaseImpl(userCredentialDataSource, emailService);
    const sendSessionRevokedEmail = new SendSessionRevokedEmailUseCaseImpl(userCredentialDataSource, emailService);

    const listeners: DomainEventListener[] = [
      new SessionStartedListener(sendSessionStartedEmail),
      new SessionRevokedListener(sendSessionRevokedEmail),
      new CredentialCreatedListener(userCredentialDataSource),
      new CredentialUpdatedListener(userCredentialDataSource),
      new CredentialDeletedListener(userCredentialDataSource),
    ];

    eventConsumer.subscribe(async (event: ConsumedEvent) => {
      for (const listener of listeners) {
        if (!listener.supports(event)) {
          continue;
        }

        try {
          await listener.onEvent(event);
        } catch (error) {
          console.error(`[notification] fallo al procesar el evento "${event.envelope.type}"`, error);
        }
      }
    });
  },
};