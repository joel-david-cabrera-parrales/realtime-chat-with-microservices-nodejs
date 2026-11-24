import { domainEventPublisher } from "../../../../plugins/events/events.provider";
import { EventPublisher } from "../../../../shared/domain/events/event-publisher";
import { SessionCreatedListener } from "./session-created.listener";
import { SessionExpiredListener } from "./session-expired.listener";
import { SessionRevokedListener } from "./session-revoked.listener";
import { CredentialCreatedListener } from "./credential-created.listener";
import { CredentialUpdatedListener } from "./credential-updated.listener";
import { CredentialDeletedListener } from "./credential-deleted.listener";
import { UserCreatedListener } from "./user-created.listener";
import { UserUpdatedListener } from "./user-updated.listener";

let registered = false;

export const registerSessionListeners = (eventPublisher: EventPublisher): void => {
  if (registered) {
    return;
  }

  registered = true;
  domainEventPublisher.subscribe(new SessionCreatedListener(eventPublisher));
  domainEventPublisher.subscribe(new SessionExpiredListener(eventPublisher));
  domainEventPublisher.subscribe(new SessionRevokedListener(eventPublisher));
  domainEventPublisher.subscribe(new CredentialCreatedListener(eventPublisher));
  domainEventPublisher.subscribe(new CredentialUpdatedListener(eventPublisher));
  domainEventPublisher.subscribe(new CredentialDeletedListener(eventPublisher));
  domainEventPublisher.subscribe(new UserCreatedListener(eventPublisher));
  domainEventPublisher.subscribe(new UserUpdatedListener(eventPublisher));
};
