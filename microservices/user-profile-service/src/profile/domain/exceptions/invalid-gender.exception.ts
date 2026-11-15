import { ProfileDomainException } from "./profile-domain.exception";

export class InvalidGenderException extends ProfileDomainException {
  constructor(value: string, allowedValues: readonly string[]) {
    super("INVALID_GENDER", `El género "${value}" no es válido. Valores permitidos: ${allowedValues.join(", ")}`);
  }
}
