import { STATUS_CODES } from "node:http";

export function httpStatusText(statusCode: number): string {
  return STATUS_CODES[statusCode] ?? "Unknown";
}
