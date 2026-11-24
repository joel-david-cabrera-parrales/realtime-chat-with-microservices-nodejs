import { EmailService } from "../../../shared/domain/email.service";
import { TypeOrmUserCredentialDataSource } from "../../infrastructure/datasources/typeorm-user-credential.datasource";
import { WelcomeEmailData } from "../../domain/use-cases/dtos/session-email.dto";
import { SendWelcomeEmailUseCase } from "../../domain/use-cases/send-welcome-email.use-case";
import { renderWelcomeEmail } from "../../infrastructure/utils/email-templates";

export class SendWelcomeEmailUseCaseImpl extends SendWelcomeEmailUseCase {
  constructor(
    private readonly userCredentialDataSource: TypeOrmUserCredentialDataSource,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  public async execute(data: WelcomeEmailData): Promise<void> {
    const userCredential = await this.userCredentialDataSource.findByCredentialCode(data.credentialCode);

    if (!userCredential || !userCredential.email) {
      console.warn(`[notification] No email found for credentialCode: ${data.credentialCode}`);
      return;
    }

    const { html, text } = renderWelcomeEmail(
      { fullName: userCredential.fullName, username: userCredential.username, email: userCredential.email },
      data.loginUrl,
      "ChatApp",
      data.profileCode,
    );

    await this.emailService.send({
      to: userCredential.email!,
      subject: "¡Bienvenido a ChatApp!",
      html,
      text,
    });
  }
}
