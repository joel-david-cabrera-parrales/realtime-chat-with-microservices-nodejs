import { ConsumedEvent } from "../../../shared/domain/events/event-consumer.service";
import { DomainEventListener } from "../../../shared/domain/events/domain-event-listener";
import { NOTIFICATION_EVENT_NAMES } from "../../domain/constants/notification-event.constants";
import { SessionCreatedEmailData } from "../../domain/use-cases/dtos/session-email.dto";
import { SendSessionStartedEmailUseCase } from "../../domain/use-cases/send-session-started-email.use-case";

export class SessionStartedListener extends DomainEventListener {
  constructor(private readonly sendSessionStartedEmail: SendSessionStartedEmailUseCase) {
    super();
  }

  public supports(event: ConsumedEvent): boolean {
    return event.envelope.type === NOTIFICATION_EVENT_NAMES.sessionCreated;
  }

  public async onEvent(event: ConsumedEvent): Promise<void> {
    await this.sendSessionStartedEmail.execute(event.envelope.data as SessionCreatedEmailData);
  }
}
