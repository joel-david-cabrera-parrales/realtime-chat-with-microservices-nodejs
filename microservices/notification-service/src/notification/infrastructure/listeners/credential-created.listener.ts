import { ConsumedEvent } from "../../../shared/domain/events/event-consumer.service";
import { DomainEventListener } from "../../../shared/domain/events/domain-event-listener";
import { TypeOrmUserCredentialDataSource } from "../datasources/typeorm-user-credential.datasource";
import { SendWelcomeEmailUseCase } from "../../domain/use-cases/send-welcome-email.use-case";
import { envService } from "../../../plugins/env/env.provider";

export interface CredentialCreatedEventData {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: string;
  createdAt: string;
}

export interface UserCreatedEventData {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: string;
  fullName: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  createdAt: string;
}

export class CredentialCreatedListener extends DomainEventListener {
  constructor(
    private readonly userCredentialDataSource: TypeOrmUserCredentialDataSource,
    private readonly sendWelcomeEmail: SendWelcomeEmailUseCase,
  ) {
    super();
  }

  public supports(event: ConsumedEvent): boolean {
    return event.envelope.type === "credential.created" || event.envelope.type === "user.created";
  }

  public async onEvent(event: ConsumedEvent): Promise<void> {
    if (event.envelope.type === "credential.created") {
      const data = event.envelope.data as CredentialCreatedEventData;
      await this.userCredentialDataSource.upsert(data.credentialCode, data.username, true);
      console.log(`[notification] Credential created locally: ${data.credentialCode}`);
    } else if (event.envelope.type === "user.created") {
      const data = event.envelope.data as UserCreatedEventData;
      await this.userCredentialDataSource.upsert(data.credentialCode, data.username, true, data.fullName, data.email);
      console.log(`[notification] User created locally: ${data.credentialCode}`);

      // Enviar email de bienvenida de forma asíncrona via evento
      const loginUrl = envService.getString("FRONTEND_LOGIN_URL", "http://localhost:5181/login");
      try {
        await this.sendWelcomeEmail.execute({
          credentialCode: data.credentialCode,
          loginUrl,
          profileCode: data.profileCode,
        });
        console.log(`[notification] Welcome email sent for credential: ${data.credentialCode}`);
      } catch (error) {
        console.error(`[notification] Failed to send welcome email for credential ${data.credentialCode}:`, error);
      }
    }
  }
}
