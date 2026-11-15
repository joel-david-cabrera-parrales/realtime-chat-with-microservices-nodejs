import { InvalidReceiptStatusException } from "../exceptions/invalid-receipt-status.exception";

export enum ReceiptStatus {
  delivered = "delivered",
  read = "read",
}

const VALID_STATUSES = new Set<string>(Object.values(ReceiptStatus));

export class ReceiptStatusValue {
  private constructor(private readonly status: ReceiptStatus) {}

  public static create(value: string): ReceiptStatusValue {
    if (!VALID_STATUSES.has(value)) {
      throw new InvalidReceiptStatusException(value);
    }

    return new ReceiptStatusValue(value as ReceiptStatus);
  }

  public static delivered(): ReceiptStatusValue {
    return new ReceiptStatusValue(ReceiptStatus.delivered);
  }

  public static read(): ReceiptStatusValue {
    return new ReceiptStatusValue(ReceiptStatus.read);
  }

  public get value(): ReceiptStatus {
    return this.status;
  }

  public isDelivered(): boolean {
    return this.status === ReceiptStatus.delivered;
  }

  public isRead(): boolean {
    return this.status === ReceiptStatus.read;
  }

  public equals(other: ReceiptStatusValue): boolean {
    return this.status === other.value;
  }

  public toString(): string {
    return this.status;
  }
}
