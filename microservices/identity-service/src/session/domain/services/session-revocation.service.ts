import { Session } from "../aggregates/session.aggregate";
import { Token } from "../aggregates/token.aggregate";

export class SessionRevocationService {
  public static revoke(session: Session, tokens: Token[]): void {
    session.revoke();

    for (const token of tokens) {
      token.revoke();
    }
  }
}
