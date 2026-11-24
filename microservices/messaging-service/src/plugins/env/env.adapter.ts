import * as env from "env-var";
import { EnvService } from "../../shared/domain/env.service";

export class EnvAdapter extends EnvService {
  public get(key: string): string {
    return env.get(key).required().asString();
  }

  public getString(key: string, defaultValue?: string): string {
    const variable = env.get(key);
    if (defaultValue !== undefined) {
      return variable.default(defaultValue).asString();
    }
    return variable.required().asString();
  }

  public getInt(key: string, defaultValue?: number): number {
    const variable = env.get(key);
    if (defaultValue !== undefined) {
      return variable.default(defaultValue).asInt();
    }
    return variable.required().asInt();
  }

  public getBool(key: string, defaultValue?: boolean): boolean {
    const variable = env.get(key);
    if (defaultValue !== undefined) {
      return variable.default(defaultValue ? "true" : "false").asBool();
    }
    return variable.required().asBool();
  }

  public getOptional(key: string): string | undefined {
    return env.get(key).asString();
  }
}
