import nodemailer, { Transporter } from "nodemailer";
import { EmailMessage, EmailService } from "../../shared/domain/email.service";

export interface NodemailerEmailOptions {
  host: string;
  port: number;
  secure: boolean;
  user?: string | undefined;
  password?: string | undefined;
  from: string;
  timeoutMs: number;
}

export class NodemailerEmailAdapter extends EmailService {
  private readonly transporter: Transporter;

  constructor(private readonly options: NodemailerEmailOptions) {
    super();

    const hasCredentials = options.user !== undefined && options.user.length > 0 && options.password !== undefined && options.password.length > 0;

    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      connectionTimeout: options.timeoutMs,
      ...(hasCredentials ? { auth: { user: options.user, pass: options.password } } : {}),
    });
  }

  public async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.options.from,
      to: message.to,
      subject: message.subject,
      ...(message.text === undefined ? {} : { text: message.text }),
      ...(message.html === undefined ? {} : { html: message.html }),
      ...(message.attachments === undefined
        ? {}
        : {
            attachments: message.attachments.map((attachment) => ({
              filename: attachment.filename,
              content: attachment.content,
              ...(attachment.contentType === undefined ? {} : { contentType: attachment.contentType }),
            })),
          }),
    });
  }
}
