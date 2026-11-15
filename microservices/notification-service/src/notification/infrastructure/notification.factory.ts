import { emailService } from "../../plugins/email/email.provider";
import { profileClient } from "../../plugins/profile/profile.provider";
import { DomainEventListener } from "../../shared/domain/events/domain-event-listener";
import { EventConsumerService, ConsumedEvent } from "../../shared/domain/events/event-consumer.service";
import { SendSessionRevokedEmailUseCaseImpl } from "../application/use-cases/send-session-revoked-email.use-case.impl";
import { SendSessionStartedEmailUseCaseImpl } from "../application/use-cases/send-session-started-email.use-case.impl";
import { SessionRevokedListener } from "./listeners/session-revoked.listener";
import { SessionStartedListener } from "./listeners/session-started.listener";


export const notificationFactory = {
  registerListeners(eventConsumer: EventConsumerService): void {
    const sendSessionStartedEmail = new SendSessionStartedEmailUseCaseImpl(profileClient, emailService);
    const sendSessionRevokedEmail = new SendSessionRevokedEmailUseCaseImpl(profileClient, emailService);

    const listeners: DomainEventListener[] = [
      new SessionStartedListener(sendSessionStartedEmail),
      new SessionRevokedListener(sendSessionRevokedEmail),
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
