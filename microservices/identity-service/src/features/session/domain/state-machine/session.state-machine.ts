import { InvalidSessionTransitionException } from "../exceptions/invalid-session-transition.exception";
import { SessionStatus } from "../value-objects/session-status.value-object";

const ALLOWED_TRANSITIONS: Record<SessionStatus, readonly SessionStatus[]> = {
  [SessionStatus.active]: [SessionStatus.expired, SessionStatus.revoked],
  [SessionStatus.expired]: [SessionStatus.revoked],
  [SessionStatus.revoked]: [],
};

export class SessionStateMachine {
  public static canTransition(from: SessionStatus, to: SessionStatus): boolean {
    return ALLOWED_TRANSITIONS[from].includes(to);
  }

  public static assertTransition(from: SessionStatus, to: SessionStatus): void {
    if (!this.canTransition(from, to)) {
      throw new InvalidSessionTransitionException(from, to);
    }
  }
}
