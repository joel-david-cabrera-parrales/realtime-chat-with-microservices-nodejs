import { EmailService } from "../../../shared/domain/email.service";
import { ProfileClientService } from "../../../shared/domain/profile.client.service";
import { SessionRevokedEmailData } from "../../domain/use-cases/dtos/session-email.dto";
import { SendSessionRevokedEmailUseCase } from "../../domain/use-cases/send-session-revoked-email.use-case";

export class SendSessionRevokedEmailUseCaseImpl extends SendSessionRevokedEmailUseCase {
  constructor(
    private readonly profileClient: ProfileClientService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  public async execute(data: SessionRevokedEmailData): Promise<void> {
    const profile = await this.profileClient.getByCode(data.profileCode);

    await this.emailService.send({
      to: profile.email,
      subject: "Sesión revocada",
      text: [
        `Hola ${profile.fullName},`,
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
