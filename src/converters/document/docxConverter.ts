import mammoth from 'mammoth';
import type { ConversionOptions } from '@/types';

/**
 * Convert DOCX to HTML
 */
export async function docxToHTML(
    file: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob> {
    onProgress?.(20);

    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(50);

    const result = await mammoth.convertToHtml({ arrayBuffer });
    onProgress?.(80);

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Document</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    ${result.value}
</body>
</html>`;

    onProgress?.(100);

    return new Blob([html as any], { type: 'text/html' });
}

/**
 * Convert DOCX to plain text
 */
export async function docxToText(
    file: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob> {
    onProgress?.(20);

    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(50);

    const result = await mammoth.extractRawText({ arrayBuffer });
    onProgress?.(80);

    const text = result.value;
    onProgress?.(100);

    return new Blob([text as any], { type: 'text/plain' });
}
