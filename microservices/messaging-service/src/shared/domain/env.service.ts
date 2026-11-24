export abstract class EnvService {
  public abstract get(key: string): string;
  public abstract getString(key: string, defaultValue?: string): string;
  public abstract getInt(key: string, defaultValue?: number): number;
  public abstract getBool(key: string, defaultValue?: boolean): boolean;
  public abstract getOptional(key: string): string | undefined;
}
