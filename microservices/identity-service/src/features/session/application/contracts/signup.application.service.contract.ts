import { SignupInput, SignupOutput } from "../../domain/use-cases/dtos/signup.dto";

export abstract class SignupApplicationServiceContract {
  public abstract signup(input: SignupInput): Promise<SignupOutput>;
}
