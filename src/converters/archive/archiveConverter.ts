import { zip, unzip } from 'fflate';

/**
 * Create a ZIP archive from multiple files
 */
export async function createZip(
    files: { name: string; data: Uint8Array }[],
    onProgress?: (progress: number) => void
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const fileObj: Record<string, Uint8Array> = {};
        files.forEach((f) => {
            fileObj[f.name] = f.data;
        });

        // Simulating progress since fflate sync is fast for small files, 
        // but async zip supports more options.
        if (onProgress) onProgress(10);

        zip(fileObj, { level: 6 }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                if (onProgress) onProgress(100);
                resolve(new Blob([data as any], { type: 'application/zip' }));
            }
        });
    });
}

/**
 * Extract files from a ZIP archive
 */
export async function extractZip(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ name: string; blob: Blob }[]> {
    const buffer = await file.arrayBuffer();
    if (onProgress) onProgress(20);

    return new Promise((resolve, reject) => {
        unzip(new Uint8Array(buffer), (err, data) => {
            if (err) {
                reject(err);
            } else {
                        const files = Object.entries(data).map(([name, content]) => ({
                            name,
                            blob: new Blob([content as any]),
                        }));
                if (onProgress) onProgress(100);
                resolve(files);
            }
        });
    });
}

/**
 * Convert archive (Main entry point)
 * Currently supports:
 * - ZIP Extraction (returns multiple files)
 * - Creating ZIP (handled by batch operation usually, but here for single format if needed)
 */
export async function convertArchive(
    file: File,
    outputFormat: string,
    onProgress?: (progress: number) => void
): Promise<Blob | Blob[]> {
    if (file.name.toLowerCase().endsWith('.zip')) {
        // Extraction
        // For now, if output is 'extract' or implied, we return multiple blobs?
        // But the main converter expects Blob | Blob[].
        // If we Extract, we return an array of blobs.

        // However, standard conversion usually changes format.
        // If input is ZIP and output is 'unzip' (virtual format), we extract.

        // Currently the system is set up for 1:1 or 1:N conversion.
        // If we return Blob[], the system zips them up again for download! 
        // That defeats the purpose of extraction if we just re-zip it.

        // Use Case: User uploads ZIP. Wants individual files.
        // If we return Blob[], the UI (useConversion) creates a ZIP from them if > 1 file.
        // So we need a way to tell the UI "This is already extracted, don't zip it, or let user download individually".

        // For now, let's implement extraction returning Blob[]. 
        // If the UI zips it back, we might need to adjust UI logic later.

        // But wait, the user request says: "Extract ZIP → individual files"
        // "UI for extraction: Show file list after extraction with individual download buttons."

        // This implies we don't just return Blob[] to be auto-downloaded. 
        // We probably need a special handling in the UI for "Archive" job types?
        // Or we treat it as a successful conversion that produced multiple files.

        const extracted = await extractZip(file, onProgress);
        // Return extracted blobs array for the UI to handle individually
        return extracted.map((item) => item.blob);
    }

    throw new Error(`Archive conversion for ${outputFormat} not supported`);
}
