import { ConsumedEvent } from "../../../shared/domain/events/event-consumer.service";
import { DomainEventListener } from "../../../shared/domain/events/domain-event-listener";
import { NOTIFICATION_EVENT_NAMES } from "../../domain/constants/notification-event.constants";
import { SessionRevokedEmailData } from "../../domain/use-cases/dtos/session-email.dto";
import { SendSessionRevokedEmailUseCase } from "../../domain/use-cases/send-session-revoked-email.use-case";

export class SessionRevokedListener extends DomainEventListener {
  constructor(private readonly sendSessionRevokedEmail: SendSessionRevokedEmailUseCase) {
    super();
  }

  public supports(event: ConsumedEvent): boolean {
    return event.envelope.type === NOTIFICATION_EVENT_NAMES.sessionRevoked;
  }

  public async onEvent(event: ConsumedEvent): Promise<void> {
    await this.sendSessionRevokedEmail.execute(event.envelope.data as SessionRevokedEmailData);
  }
}
