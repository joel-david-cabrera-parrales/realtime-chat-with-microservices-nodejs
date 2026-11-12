import { RefreshTokenPairInput, RefreshTokenPairOutput } from "./dtos/refresh-token-pair.dto";

export abstract class RefreshTokenPairUseCase {
  public abstract execute(input: RefreshTokenPairInput): Promise<RefreshTokenPairOutput>;
}
