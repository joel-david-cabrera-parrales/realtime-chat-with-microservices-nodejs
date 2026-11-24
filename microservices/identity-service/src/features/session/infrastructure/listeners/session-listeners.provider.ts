import { domainEventPublisher } from "../../../../plugins/events/events.provider";
import { EventPublisher } from "../../../../shared/domain/events/event-publisher";
import { SessionCreatedListener } from "./session-created.listener";
import { SessionExpiredListener } from "./session-expired.listener";
import { SessionRevokedListener } from "./session-revoked.listener";

let registered = false;

export const registerSessionListeners = (eventPublisher: EventPublisher): void => {
  if (registered) {
    return;
  }

  registered = true;
  domainEventPublisher.subscribe(new SessionCreatedListener(eventPublisher));
  domainEventPublisher.subscribe(new SessionExpiredListener(eventPublisher));
  domainEventPublisher.subscribe(new SessionRevokedListener(eventPublisher));
};
