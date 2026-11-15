import { InvalidTokenTransitionException } from "../exceptions/invalid-token-transition.exception";
import { TokenStatus } from "../value-objects/token-status.value-object";

const ALLOWED_TRANSITIONS: Record<TokenStatus, readonly TokenStatus[]> = {
  [TokenStatus.active]: [TokenStatus.expired, TokenStatus.revoked],
  [TokenStatus.expired]: [],
  [TokenStatus.revoked]: [],
};

export class TokenStateMachine {
  public static canTransition(from: TokenStatus, to: TokenStatus): boolean {
    return ALLOWED_TRANSITIONS[from].includes(to);
  }

  public static assertTransition(from: TokenStatus, to: TokenStatus): void {
    if (!this.canTransition(from, to)) {
      throw new InvalidTokenTransitionException(from, to);
    }
  }
}
