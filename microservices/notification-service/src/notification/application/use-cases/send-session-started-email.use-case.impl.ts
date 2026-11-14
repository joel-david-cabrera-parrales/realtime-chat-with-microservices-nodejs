import { EmailService } from "../../../shared/domain/email.service";
import { ProfileClientService } from "../../../shared/domain/profile.client.service";
import { SessionCreatedEmailData } from "../../domain/use-cases/dtos/session-email.dto";
import { SendSessionStartedEmailUseCase } from "../../domain/use-cases/send-session-started-email.use-case";

export class SendSessionStartedEmailUseCaseImpl extends SendSessionStartedEmailUseCase {
  constructor(
    private readonly profileClient: ProfileClientService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  public async execute(data: SessionCreatedEmailData): Promise<void> {
    const profile = await this.profileClient.getByCode(data.profileCode);

    await this.emailService.send({
      to: profile.email,
      subject: "Inicio de sesión",
      text: [
        `Hola ${profile.fullName},`,
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
