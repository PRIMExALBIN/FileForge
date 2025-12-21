import { FORMATS, type FormatDefinition } from '@/constants/formats';
import type { FormatInfo, FormatCategory } from '@/types';

// Magic bytes for file format detection
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }> = {
    jpg: { bytes: [0xff, 0xd8, 0xff], offset: 0 },
    png: { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
    gif: { bytes: [0x47, 0x49, 0x46], offset: 0 },
    webp: { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
    pdf: { bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 },
    zip: { bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 },
    bmp: { bytes: [0x42, 0x4d], offset: 0 },
};

/**
 * Helper to map newer FormatDefinition to app legacy FormatInfo
 */
function mapToFormatInfo(def: FormatDefinition, ext: string): FormatInfo {
    return {
        extension: ext,
        name: def.label,
        category: def.category,
        mimeTypes: def.mimeTypes,
        compatibleOutputs: def.compatibleOutputs,
        description: def.label,
        supportsQuality: ['jpg', 'jpeg', 'webp', 'png'].includes(ext),
        supportsResize: def.category === 'image',
    };
}

/**
 * Detect file format using magic bytes, MIME type, and extension
 */
export async function detectFormat(file: File): Promise<{
    extension: string;
    mimeType: string;
    category: FormatCategory;
    confidence: 'high' | 'medium' | 'low';
    detectedBy: 'magic-bytes' | 'mime-type' | 'extension';
}> {
    // Try magic bytes first (most reliable)
    const magicDetected = await detectByMagicBytes(file);
    if (magicDetected) {
        const info = FORMATS[magicDetected];
        return {
            extension: magicDetected,
            mimeType: info?.mimeTypes[0] || file.type,
            category: info?.category || 'other',
            confidence: 'high',
            detectedBy: 'magic-bytes',
        };
    }

    // Try MIME type
    if (file.type) {
        const extensionByMime = getExtensionFromMimeType(file.type);
        if (extensionByMime) {
            const info = FORMATS[extensionByMime];
            return {
                extension: extensionByMime,
                mimeType: file.type,
                category: info?.category || 'other',
                confidence: 'medium',
                detectedBy: 'mime-type',
            };
        }
    }

    // Fall back to file extension
    const extension = getFileExtension(file.name);
    const info = FORMATS[extension];
    return {
        extension,
        mimeType: info?.mimeTypes[0] || 'application/octet-stream',
        category: info?.category || 'other',
        confidence: 'low',
        detectedBy: 'extension',
    };
}

/**
 * Detect format by reading magic bytes from file
 */
async function detectByMagicBytes(file: File): Promise<string | null> {
    try {
        const buffer = await file.slice(0, 16).arrayBuffer();
        const bytes = new Uint8Array(buffer);

        for (const [format, { bytes: magicBytes, offset }] of Object.entries(MAGIC_BYTES)) {
            if (matchesBytes(bytes, magicBytes, offset)) {
                return format;
            }
        }
    } catch (error) {
        console.error('Error reading magic bytes:', error);
    }
    return null;
}

/**
 * Check if bytes match magic signature
 */
function matchesBytes(fileBytes: Uint8Array, magicBytes: number[], offset: number): boolean {
    for (let i = 0; i < magicBytes.length; i++) {
        if (fileBytes[offset + i] !== magicBytes[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    const parts = filename.toLowerCase().split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Get extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string | null {
    for (const [ext, info] of Object.entries(FORMATS) as [string, FormatDefinition][]) {
        if (info.mimeTypes.includes(mimeType)) {
            return ext;
        }
    }
    return null;
}

/**
 * Get format info by extension
 */
export function getFormatInfo(extension: string): FormatInfo | undefined {
    const def = FORMATS[extension.toLowerCase()];
    if (!def) return undefined;
    return mapToFormatInfo(def, extension.toLowerCase());
}

/**
 * Get all formats in a category
 */
export function getFormatsByCategory(category: FormatCategory): FormatInfo[] {
    return (Object.entries(FORMATS) as [string, FormatDefinition][])
        .filter(([, info]) => info.category === category)
        .map(([ext, info]) => mapToFormatInfo(info, ext));
}

/**
 * Check if conversion is supported
 */
export function isConversionSupported(inputFormat: string, outputFormat: string): boolean {
    const info = FORMATS[inputFormat.toLowerCase()];
    if (!info) return false;
    return info.compatibleOutputs.includes(outputFormat.toLowerCase());
}

/**
 * Get suggested output formats for a file
 */
export function getSuggestedFormats(inputFormat: string): string[] {
    const info = FORMATS[inputFormat.toLowerCase()];
    return info?.compatibleOutputs || [];
}

/**
 * Priority conversions for Quick Convert mode
 */
export const QUICK_CONVERT_SUGGESTIONS: Record<string, string> = {
    heic: 'jpg',
    webp: 'png',
    png: 'jpg',
    pdf: 'jpg',
    xlsx: 'csv',
    csv: 'xlsx',
    docx: 'pdf',
    gif: 'mp4',
};
