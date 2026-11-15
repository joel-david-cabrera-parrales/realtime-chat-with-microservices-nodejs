import { STATUS_CODES } from "node:http";

export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly error: string;

  constructor(statusCode: number, message: string, error?: string) {
    super(message);
    this.statusCode = statusCode;
    this.error = error ?? STATUS_CODES[statusCode] ?? "Error";
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
