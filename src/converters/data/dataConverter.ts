import * as yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as toml from 'smol-toml';
import type { ConversionOptions } from '@/types';

/**
 * Convert JSON to TOML
 */
export async function jsonToTOML(
    file: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob> {
    onProgress?.(20);

    const text = await file.text();
    const jsonData = JSON.parse(text);
    onProgress?.(50);

    const tomlString = toml.stringify(jsonData);
    onProgress?.(100);

    return new Blob([tomlString], { type: 'application/toml' });
}

/**
 * Convert TOML to JSON
 */
export async function tomlToJSON(
    file: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob> {
    onProgress?.(20);

    const text = await file.text();
    onProgress?.(50);

    const data = toml.parse(text);
    const jsonString = JSON.stringify(data, null, 2);
    onProgress?.(100);

    return new Blob([jsonString], { type: 'application/json' });
}


/**
 * Convert JSON to YAML
 */
export async function jsonToYAML(
    file: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob> {
    onProgress?.(20);

    const text = await file.text();
    const jsonData = JSON.parse(text);
    onProgress?.(50);

    const yamlString = yaml.dump(jsonData);
    onProgress?.(100);

    return new Blob([yamlString], { type: 'application/x-yaml' });
}

/**
 * Convert YAML to JSON
 */
export async function yamlToJSON(
    file: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob> {
    onProgress?.(20);

    const text = await file.text();
    onProgress?.(50);

    const data = yaml.load(text);
    const jsonString = JSON.stringify(data, null, 2);
    onProgress?.(100);

    return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Convert JSON to XML
 */
export async function jsonToXML(
    file: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob> {
    onProgress?.(20);

    const text = await file.text();
    const jsonData = JSON.parse(text);
    onProgress?.(50);

    const builder = new XMLBuilder({
        format: true,
        ignoreAttributes: false,
    });

    const xmlString = builder.build({ root: jsonData });
    onProgress?.(100);

    return new Blob([xmlString], { type: 'application/xml' });
}

/**
 * Convert XML to JSON
 */
export async function xmlToJSON(
    file: File,
    options: ConversionOptions = {},
    onProgress?: (progress: number) => void
): Promise<Blob> {
    onProgress?.(20);

    const text = await file.text();
    onProgress?.(50);

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
    });

    const data = parser.parse(text);
    const jsonString = JSON.stringify(data, null, 2);
    onProgress?.(100);

    return new Blob([jsonString], { type: 'application/json' });
}
