import { EmailService } from "../../../shared/domain/email.service";
import { TypeOrmUserCredentialDataSource } from "../../infrastructure/datasources/typeorm-user-credential.datasource";
import { SessionCreatedEmailData } from "../../domain/use-cases/dtos/session-email.dto";
import { SendSessionStartedEmailUseCase } from "../../domain/use-cases/send-session-started-email.use-case";

export class SendSessionStartedEmailUseCaseImpl extends SendSessionStartedEmailUseCase {
  constructor(
    private readonly userCredentialDataSource: TypeOrmUserCredentialDataSource,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  public async execute(data: SessionCreatedEmailData): Promise<void> {
    const userCredential = await this.userCredentialDataSource.findByCredentialCode(data.credentialCode);

    if (!userCredential || !userCredential.email) {
      console.warn(`[notification] No email found for credentialCode: ${data.credentialCode}`);
      return;
    }

    await this.emailService.send({
      to: userCredential.email,
      subject: "Inicio de sesión",
      text: [
        `Hola ${userCredential.fullName ?? userCredential.username},`,
        "",
        "Se ha iniciado una sesión en tu cuenta.",
        "",
        `Id de sesión: ${data.sessionId}`,
        `Expira: ${data.expiresAt}`,
        "",
        "Si no fuiste tú, revoca la sesión inmediatamente.",
      ].join("\n"),
    });
  }
}