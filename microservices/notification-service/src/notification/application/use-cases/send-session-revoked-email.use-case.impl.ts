import { EmailService } from "../../../shared/domain/email.service";
import { TypeOrmUserCredentialDataSource } from "../../infrastructure/datasources/typeorm-user-credential.datasource";
import { SessionRevokedEmailData } from "../../domain/use-cases/dtos/session-email.dto";
import { SendSessionRevokedEmailUseCase } from "../../domain/use-cases/send-session-revoked-email.use-case";

export class SendSessionRevokedEmailUseCaseImpl extends SendSessionRevokedEmailUseCase {
  constructor(
    private readonly userCredentialDataSource: TypeOrmUserCredentialDataSource,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  public async execute(data: SessionRevokedEmailData): Promise<void> {
    const userCredential = await this.userCredentialDataSource.findByCredentialCode(data.credentialCode);

    if (!userCredential || !userCredential.email) {
      console.warn(`[notification] No email found for credentialCode: ${data.credentialCode}`);
      return;
    }

    await this.emailService.send({
      to: userCredential.email,
      subject: "Sesión revocada",
      text: [
        `Hola ${userCredential.fullName ?? userCredential.username},`,
        "",
        "Se ha revocado una sesión de tu cuenta.",
        "",
        `Id de sesión: ${data.sessionId}`,
        `Revocada: ${data.revokedAt}`,
        `Motivo: ${data.reason ?? "no especificado"}`,
        "",
        "Si no fuiste tú, cambia tu contraseña de inmediato.",
      ].join("\n"),
    });
  }
}