import multer from "multer";

export const MAX_AVATAR_SIZE_BYTES = 15 * 1024 * 1024;

export function buildAvatarUploadMiddleware() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_AVATAR_SIZE_BYTES, files: 1 },
  });
}
