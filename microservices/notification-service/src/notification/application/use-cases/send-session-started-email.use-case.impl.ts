import { EmailService } from "../../../shared/domain/email.service";
import { TypeOrmUserCredentialDataSource } from "../../infrastructure/datasources/typeorm-user-credential.datasource";
import { SessionCreatedEmailData } from "../../domain/use-cases/dtos/session-email.dto";
import { SendSessionStartedEmailUseCase } from "../../domain/use-cases/send-session-started-email.use-case";
import { renderSessionCreatedEmail } from "../../infrastructure/utils/email-templates";

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

    const { html, text } = renderSessionCreatedEmail(
      { fullName: userCredential.fullName, username: userCredential.username, email: userCredential.email },
      data
    );

    await this.emailService.send({
      to: userCredential.email!,
      subject: "Nuevo inicio de sesión",
      html,
      text,
    });
  }
}