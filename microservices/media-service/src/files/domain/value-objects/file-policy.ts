import { FileCategory } from "../enums/file-category.enum";

export interface FilePolicy {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  storagePrefix: string;
}

export const PROFILE_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/csv",
  "text/plain",
];

export const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024;

const EXTENSION_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function getFilePolicy(category: FileCategory): FilePolicy {
  if (category === FileCategory.PROFILE_PHOTO) {
    return {
      allowedMimeTypes: PROFILE_PHOTO_MIME_TYPES,
      maxSizeBytes: MAX_PROFILE_PHOTO_SIZE_BYTES,
      storagePrefix: "profiles",
    };
  }

  return {
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
    storagePrefix: "documents",
  };
}

export function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts[parts.length - 1] ?? "").toLowerCase() : "";
}

export function resolveMimeType(fileName: string, mimeType: string): string {
  const extensionMime = EXTENSION_MIME_TYPES[getExtension(fileName)];

  if (extensionMime !== undefined) {
    return extensionMime;
  }

  return mimeType;
}

export function isAllowedMimeType(category: FileCategory, mimeType: string): boolean {
  return getFilePolicy(category).allowedMimeTypes.includes(mimeType);
}
