import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';
import Pica from 'pica';
import type { ConversionOptions } from '@/types';

const pica = new Pica();

/**
 * Main image converter function
 */
export async function convertImage(
    file: File,
    outputFormat: string,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob> {
    onProgress?.(10);

    // Handle HEIC/HEIF conversion first
    if (file.type === 'image/heic' || file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        file = await convertHEIC(file, onProgress);
    }

    onProgress?.(30);

    // Load image
    const img = await loadImage(file);
    onProgress?.(50);

    // Create canvas with desired dimensions
    const canvas = document.createElement('canvas');
    let width = options.width || img.width;
    let height = options.height || img.height;

    // Maintain aspect ratio if requested
    if (options.maintainAspectRatio && (options.width || options.height)) {
        const aspectRatio = img.width / img.height;
        if (options.width && !options.height) {
            height = options.width / aspectRatio;
        } else if (options.height && !options.width) {
            width = options.height * aspectRatio;
        }
    }

    canvas.width = width;
    canvas.height = height;

    // Use Pica for high-quality resizing if dimensions changed
    if (width !== img.width || height !== img.height) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(img, 0, 0);

        await pica.resize(tempCanvas, canvas, {
            quality: 3,
            alpha: true,
        });
    } else {
        const ctx = canvas.getContext('2d')!;

        // Handle background color for formats that don't support transparency
        if (['jpg', 'jpeg', 'bmp'].includes(outputFormat) && options.backgroundColor) {
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
    }

    onProgress?.(70);

    // Apply rotation if specified
    if (options.rotate) {
        const rotated = await rotateCanvas(canvas, options.rotate);
        canvas.width = rotated.width;
        canvas.height = rotated.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(rotated, 0, 0);
    }

    onProgress?.(80);

    // Convert to target format
    const outputBlob = await canvasToBlob(canvas, outputFormat, options.quality || 85);

    onProgress?.(100);

    return outputBlob;
}

/**
 * Convert HEIC to JPEG using heic2any
 */
async function convertHEIC(file: File, onProgress?: (progress: number) => void): Promise<File> {
    try {
        onProgress?.(20);
        const blob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9,
        });

        // heic2any can return array or single blob
        const resultBlob = Array.isArray(blob) ? blob[0] : blob;

        return new File([resultBlob], file.name.replace(/\.heic$/i, '.jpg'), {
            type: 'image/jpeg',
        });
    } catch (error) {
        console.error('HEIC conversion error:', error);
        throw new Error('Failed to convert HEIC image');
    }
}

/**
 * Load image from file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

/**
 * Rotate canvas by degrees
 */
async function rotateCanvas(canvas: HTMLCanvasElement, degrees: number): Promise<HTMLCanvasElement> {
    const rotated = document.createElement('canvas');
    const radians = (degrees * Math.PI) / 180;

    // Swap dimensions for 90 or 270 degree rotations
    if (degrees === 90 || degrees === 270) {
        rotated.width = canvas.height;
        rotated.height = canvas.width;
    } else {
        rotated.width = canvas.width;
        rotated.height = canvas.height;
    }

    const ctx = rotated.getContext('2d')!;
    ctx.translate(rotated.width / 2, rotated.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    return rotated;
}

/**
 * Convert canvas to blob with specified format and quality
 */
function canvasToBlob(
    canvas: HTMLCanvasElement,
    format: string,
    quality: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const mimeType = getMimeType(format);

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to convert canvas to blob'));
                }
            },
            mimeType,
            quality / 100
        );
    });
}

/**
 * Get MIME type from format
 */
function getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
        bmp: 'image/bmp',
        ico: 'image/x-icon',
    };

    return mimeTypes[format.toLowerCase()] || 'image/png';
}

/**
 * Convert image to ICO format
 */
export async function convertToICO(
    file: File,
    options: ConversionOptions = {}
): Promise<Blob> {
    // ICO conversion requires specific library or canvas manipulation
    // For now, we'll resize to 32x32 and convert to PNG
    const size = options.width || 32;

    const blob = await convertImage(file, 'png', {
        ...options,
        width: size,
        height: size,
        maintainAspectRatio: false,
    });

    return blob;
}
