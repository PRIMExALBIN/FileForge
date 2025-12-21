import { marked } from "marked";
import type { ConversionOptions } from "@/types";

/**
 * Convert Markdown to HTML
 */
export async function markdownToHTML(
  file: File,
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  onProgress?.(20);

  const text = await file.text();
  onProgress?.(50);

  const htmlContent = await marked(text);
  onProgress?.(80);

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Markdown</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        pre code {
            background: none;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 0;
            padding-left: 20px;
            color: #666;
        }
        img {
            max-width: 100%;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

  onProgress?.(100);

  return new Blob([html], { type: "text/html" });
}

/**
 * Convert HTML to plain text
 */
export async function htmlToText(
  file: File,
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  onProgress?.(20);

  const html = await file.text();
  onProgress?.(50);

  // Parse HTML and extract text
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const text = doc.body.textContent || "";

  onProgress?.(100);

  return new Blob([text], { type: "text/plain" });
}

/**
 * Convert text to HTML
 */
export async function textToHTML(
  file: File,
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  onProgress?.(20);

  const text = await file.text();
  onProgress?.(50);

  // Preserve line breaks and basic formatting
  const htmlContent = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Text</title>
    <style>
        body {
            font-family: monospace;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

  onProgress?.(100);

  return new Blob([html], { type: "text/html" });
}
