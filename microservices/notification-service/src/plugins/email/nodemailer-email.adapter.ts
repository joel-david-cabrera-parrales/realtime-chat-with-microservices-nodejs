import nodemailer, { Transporter, SentMessageInfo } from "nodemailer";
import { EmailMessage, EmailService } from "../../shared/domain/email.service";

export interface NodemailerEmailOptions {
  host: string;
  port: number;
  secure: boolean;
  user?: string | undefined;
  password?: string | undefined;
  from: string;
  timeoutMs: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class NodemailerEmailAdapter extends EmailService {
  private readonly transporter: Transporter;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

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

    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 2000;
  }

  public async send(message: EmailMessage): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const info: SentMessageInfo = await this.transporter.sendMail({
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

        console.log(
          `[email] Email sent successfully to ${Array.isArray(message.to) ? message.to.join(", ") : message.to} (messageId: ${info.messageId})`,
        );
        return;
      } catch (error) {
        lastError = error as Error;
        const isLastAttempt = attempt === this.maxRetries;

        console.warn(
          `[email] Attempt ${attempt}/${this.maxRetries} failed to send email to ${Array.isArray(message.to) ? message.to.join(", ") : message.to}:`,
          error,
        );

        if (!isLastAttempt) {
          await this.sleep(this.retryDelayMs * attempt); // Exponential backoff
        }
      }
    }

    // All retries exhausted
    console.error(
      `[email] Failed to send email after ${this.maxRetries} attempts to ${Array.isArray(message.to) ? message.to.join(", ") : message.to}:`,
      lastError,
    );
    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Verify connection on startup
  public async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("[email] SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("[email] SMTP connection verification failed:", error);
      return false;
    }
  }
}
