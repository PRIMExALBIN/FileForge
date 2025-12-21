/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Create a File object from Blob
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

/**
 * Read file as ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read file as Data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Validate file size (max 2GB)
 */
export function validateFileSize(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
  const WARNING_SIZE = 500 * 1024 * 1024; // 500MB

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size of 2GB`,
    };
  }

  if (file.size > WARNING_SIZE) {
    console.warn(
      `Large file detected: ${formatFileSize(file.size)}. Processing may be slow.`,
    );
  }

  return { valid: true };
}

/**
 * Generate unique ID for jobs
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize filename for download
 */
export function sanitizeFilename(filename: string): string {
  // Replace path/filename characters and control characters safely
  const invalid = new Set(["<", ">", ":", '"', "/", "\\", "|", "?", "*"]);
  const cleaned = filename
    .split("")
    .map((ch) => (invalid.has(ch) || ch.charCodeAt(0) < 32 ? "_" : ch))
    .join("")
    .trim();
  return cleaned;
}

/**
 * Change file extension
 */
export function changeExtension(
  filename: string,
  newExtension: string,
): string {
  const parts = filename.split(".");
  if (parts.length > 1) {
    parts[parts.length - 1] = newExtension;
    return parts.join(".");
  }
  return `${filename}.${newExtension}`;
}

/**
 * Estimate conversion time based on file size and format
 */
export function estimateConversionTime(
  fileSize: number,
  inputFormat: string,
  outputFormat: string,
): number {
  // Base time in ms (rough estimates)
  const baseTimePerMB: Record<string, number> = {
    image: 100,
    document: 200,
    spreadsheet: 150,
    archive: 300,
    data: 50,
  };

  // Get category-based estimate
  const sizeMB = fileSize / (1024 * 1024);
  let baseTime = baseTimePerMB.image; // default

  // More complex conversions take longer
  if (outputFormat === "pdf" || inputFormat === "pdf") {
    baseTime *= 1.5;
  }

  return Math.ceil(sizeMB * baseTime);
}

/**
 * Format milliseconds to human-readable time
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return "Less than a second";

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""}`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Revoke object URL to free memory
 */
export function revokeObjectURL(url: string): void {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Create object URL from blob
 */
export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Copy blob to clipboard (images only)
 */
export async function copyBlobToClipboard(blob: Blob): Promise<void> {
  if (!navigator.clipboard || !navigator.clipboard.write) {
    throw new Error("Clipboard API not supported");
  }

  const item = new ClipboardItem({ [blob.type]: blob });
  await navigator.clipboard.write([item]);
}

/**
 * Check if format supports clipboard copy
 */
export function supportsClipboardCopy(format: string): boolean {
  const supportedFormats = ["png", "jpg", "jpeg", "webp", "gif"];
  return supportedFormats.includes(format.toLowerCase());
}
