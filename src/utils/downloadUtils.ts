import JSZip from "jszip";
import { sanitizeFilename, changeExtension } from "./fileUtils";

/**
 * Download a single file
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = sanitizeFilename(filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download multiple files as ZIP
 */
export async function downloadFilesAsZip(
  files: Array<{ blob: Blob; filename: string }>,
  zipFilename = "converted-files.zip",
): Promise<void> {
  const zip = new JSZip();

  // Add all files to ZIP
  files.forEach(({ blob, filename }) => {
    zip.file(sanitizeFilename(filename), blob);
  });

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: "blob" });

  // Download ZIP
  downloadFile(zipBlob, zipFilename);
}

/**
 * Generate output filename
 */
export function generateOutputFilename(
  inputFilename: string,
  outputFormat: string,
): string {
  return changeExtension(inputFilename, outputFormat);
}
