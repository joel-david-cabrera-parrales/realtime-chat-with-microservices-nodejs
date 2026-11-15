import { envService } from "../env/env.provider";
import { S3Adapter } from "./s3.adapter";

export const s3Adapter = new S3Adapter({
  endpoint: envService.getOptional("AWS_S3_ENDPOINT") ?? "http://localhost:4568",
  bucket: envService.getOptional("AWS_S3_BUCKET") ?? "chat-bucket-local",
  region: envService.getOptional("AWS_REGION") ?? "us-east-1",
  accessKeyId: envService.getOptional("AWS_ACCESS_KEY_ID") ?? "test",
  secretAccessKey: envService.getOptional("AWS_SECRET_ACCESS_KEY") ?? "test",
});
