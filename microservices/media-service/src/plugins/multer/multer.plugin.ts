import multer from "multer";

export const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;

export function buildUploadMiddleware(maxSizeBytes: number = MAX_UPLOAD_SIZE_BYTES) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeBytes,
      files: 1,
    },
  });
}
