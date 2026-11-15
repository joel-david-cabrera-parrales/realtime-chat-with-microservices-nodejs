import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { S3Object, S3StorageService } from "../../shared/domain/s3.storage.service";

export interface S3AdapterOptions {
  endpoint?: string;
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export class S3Adapter extends S3StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(options: S3AdapterOptions) {
    super();
    this.bucket = options.bucket;

    this.client = new S3Client({
      region: options.region,
      ...(options.endpoint ? { endpoint: options.endpoint, forcePathStyle: true } : {}),
      ...(options.accessKeyId && options.secretAccessKey
        ? { credentials: { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey } }
        : {}),
    });
  }

  public getBucketName(): string {
    return this.bucket;
  }

  public async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  public async getObject(key: string): Promise<S3Object> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));

    if (!result.Body) {
      throw new Error(`S3 object has no body: ${key}`);
    }

    return {
      body: Readable.from(result.Body as AsyncIterable<Uint8Array>),
      ...(result.ContentType !== undefined ? { contentType: result.ContentType } : {}),
      ...(result.ContentLength !== undefined ? { contentLength: result.ContentLength } : {}),
    };
  }

  public async getObjectBuffer(key: string): Promise<Buffer> {
    const { body } = await this.getObject(key);
    const chunks: Buffer[] = [];

    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  public async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  public destroy(): void {
    this.client.destroy();
  }
}
