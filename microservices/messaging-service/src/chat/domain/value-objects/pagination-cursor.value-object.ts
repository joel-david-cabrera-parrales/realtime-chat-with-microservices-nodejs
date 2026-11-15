import { InvalidPaginationCursorException } from "../exceptions/invalid-pagination-cursor.exception";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface PaginationCursorProps {
  createdAt: Date;
  code: string;
}

export class PaginationCursor {
  private constructor(private readonly props: PaginationCursorProps) {}

  public static create(createdAt: Date, code: string): PaginationCursor {
    if (Number.isNaN(createdAt.getTime())) {
      throw new InvalidPaginationCursorException(createdAt.toISOString());
    }

    const normalizedCode = code.trim().toLowerCase();

    if (!UUID_PATTERN.test(normalizedCode)) {
      throw new InvalidPaginationCursorException(code);
    }

    return new PaginationCursor({
      createdAt: new Date(createdAt.getTime()),
      code: normalizedCode,
    });
  }

  public static decode(value: string): PaginationCursor {
    const [createdAtPart, codePart] = value.split("|");

    if (!createdAtPart || !codePart) {
      throw new InvalidPaginationCursorException(value);
    }

    const createdAt = new Date(createdAtPart);

    if (Number.isNaN(createdAt.getTime())) {
      throw new InvalidPaginationCursorException(value);
    }

    return PaginationCursor.create(createdAt, codePart);
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  public get code(): string {
    return this.props.code;
  }

  public encode(): string {
    return `${this.props.createdAt.toISOString()}|${this.props.code}`;
  }

  public toPrimitives(): { createdAt: string; code: string } {
    return {
      createdAt: this.props.createdAt.toISOString(),
      code: this.props.code,
    };
  }
}
