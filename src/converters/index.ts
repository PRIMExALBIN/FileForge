import type { ConversionOptions } from '@/types';
import { convertImage } from './image/imageConverter';
import { imagesToPDF, pdfToImages, pdfToText } from './document/pdfConverter';
import { docxToHTML, docxToText } from './document/docxConverter';
import { markdownToHTML, htmlToText, textToHTML } from './document/textConverter';
import {
    xlsxToCSV,
    csvToXLSX,
    xlsxToJSON,
    jsonToXLSX,
    csvToJSON,
    jsonToCSV
} from './spreadsheet/spreadsheetConverter';
import { jsonToYAML, yamlToJSON, jsonToXML, xmlToJSON, jsonToTOML, tomlToJSON } from './data/dataConverter';
import { convertAudio } from './audio/audioConverter';
import { convertVideo } from './video/videoConverter';
import { convertArchive } from './archive/archiveConverter';
import { FORMATS } from '@/constants/formats';

/**
 * Main converter router - dispatches to appropriate converter based on format
 */
export async function convertFile(
    file: File,
    inputFormat: string,
    outputFormat: string,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob | Blob[]> {
    const input = inputFormat.toLowerCase();
    const output = outputFormat.toLowerCase();

    // Get category from registry
    const formatDef = FORMATS[input];
    if (!formatDef) {
        throw new Error(`Unsupported input format: ${input}`);
    }

    const category = formatDef.category;

    switch (category) {
        case 'image':
            if (output === 'pdf') {
                return await imagesToPDF([file], options, onProgress);
            }
            return await convertImage(file, output, options, onProgress);

        case 'audio':
            return await convertAudio(file, input, output, options, onProgress);

        case 'video':
            // Video can output to audio (mp3) or image (gif) too, but handled in video converter
            return await convertVideo(file, input, output, options, onProgress);

        case 'archive':
            // Archive usually means extraction
            if (output === 'extract') {
                return await convertArchive(file, output, onProgress);
            }
            // Or conversion to another archive format (e.g. rar -> zip)
            // For now, archiveConverter mostly handles extraction or zip creation
            return await convertArchive(file, output, onProgress);

        case 'spreadsheet':
            if (input === 'xlsx') {
                if (output === 'csv') return await xlsxToCSV(file, options, onProgress);
                if (output === 'json') return await xlsxToJSON(file, options, onProgress);
            }
            if (input === 'csv') {
                if (output === 'xlsx') return await csvToXLSX(file, options, onProgress);
                if (output === 'json') return await csvToJSON(file, options, onProgress);
            }
            // Fallback
            throw new Error(`Conversion from ${input} to ${output} not supported yet for spreadsheets`);

        case 'data':
            if (input === 'json') {
                if (output === 'xlsx') return await jsonToXLSX(file, options, onProgress);
                if (output === 'csv') return await jsonToCSV(file, options, onProgress);
                if (output === 'yaml' || output === 'yml') return await jsonToYAML(file, options, onProgress);
                if (output === 'xml') return await jsonToXML(file, options, onProgress);
                if (output === 'toml') return await jsonToTOML(file, options, onProgress);
            }
            if (input === 'yaml' || input === 'yml') {
                if (output === 'json') return await yamlToJSON(file, options, onProgress);
            }
            if (input === 'xml') {
                if (output === 'json') return await xmlToJSON(file, options, onProgress);
            }
            if (input === 'toml') {
                if (output === 'json') return await tomlToJSON(file, options, onProgress);
            }
            throw new Error(`Conversion from ${input} to ${output} not supported yet for data files`);

        case 'document':
            // PDF
            if (input === 'pdf') {
                const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'heif', 'ico'];
                if (imageFormats.includes(output)) {
                    return await pdfToImages(file, output, options, onProgress);
                } else if (output === 'txt') {
                    return await pdfToText(file, onProgress);
                }
            }

            // DOCX
            if (input === 'docx') {
                if (output === 'html') {
                    return await docxToHTML(file, options, onProgress);
                } else if (output === 'txt') {
                    return await docxToText(file, options, onProgress);
                }
            }

            // Text / Markdown / HTML
            if (input === 'md' && output === 'html') {
                return await markdownToHTML(file, options, onProgress);
            }
            if (input === 'html' && output === 'txt') {
                return await htmlToText(file, options, onProgress);
            }
            if (input === 'txt' && output === 'html') {
                return await textToHTML(file, options, onProgress);
            }

            // Fallback for document
            throw new Error(`Conversion from ${input} to ${output} not supported yet for documents`);

        default:
            throw new Error(`No converter found for category: ${category}`);
    }
}

/**
 * Check if a conversion is supported
 */
export function isConversionSupported(inputFormat: string, outputFormat: string): boolean {
    const input = inputFormat.toLowerCase();
    const output = outputFormat.toLowerCase();

    const format = FORMATS[input];
    if (!format) return false;

    // Special case cases where compatibleOutputs might be dynamic or generic
    if (format.compatibleOutputs.includes(output)) return true;

    return false;
}
// Removed duplicate export
