export type S3Object = {
  body: NodeJS.ReadableStream;
  contentType?: string;
  contentLength?: number;
};

export abstract class S3StorageService {
  public abstract getBucketName(): string;
  public abstract putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  public abstract getObject(key: string): Promise<S3Object>;
  public abstract getObjectBuffer(key: string): Promise<Buffer>;
  public abstract deleteObject(key: string): Promise<void>;
}
