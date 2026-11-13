import multer from "multer";

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export function buildUploadMiddleware(maxSizeBytes: number = MAX_AVATAR_SIZE_BYTES) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeBytes,
      files: 1,
    },
  });
}
