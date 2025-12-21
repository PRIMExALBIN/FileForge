import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import type { ConversionOptions } from "@/types";
import JSZip from "jszip";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Convert images to PDF (combine multiple into one)
 */
export async function imagesToPDF(
  files: File[],
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    onProgress?.((i / files.length) * 80);

    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let image;
    if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
      image = await pdfDoc.embedPng(uint8Array);
    } else if (
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.name.toLowerCase().match(/\.(jpg|jpeg)$/)
    ) {
      image = await pdfDoc.embedJpg(uint8Array);
    } else {
      // Convert to JPEG first for other formats
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = await loadImageFromFile(file);

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const jpegBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.95);
      });

      const jpegArray = new Uint8Array(await jpegBlob.arrayBuffer());
      image = await pdfDoc.embedJpg(jpegArray);
    }

    // Add page with image dimensions
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  onProgress?.(90);

  const pdfBytes = await pdfDoc.save();
  onProgress?.(100);

  return new Blob([pdfBytes as any], { type: "application/pdf" });
}

/**
 * Convert PDF to images (returns ZIP with all pages)
 */
export async function pdfToImages(
  file: File,
  outputFormat = "png",
  options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const numPages = pdf.numPages;
  const zip = new JSZip();

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.((pageNum / numPages) * 90); // Reserve 10% for ZIP creation

    const page = await pdf.getPage(pageNum);
    const scale = options.width
      ? options.width / page.getViewport({ scale: 1 }).width
      : 2;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const mimeType =
      outputFormat === "jpg" || outputFormat === "jpeg"
        ? "image/jpeg"
        : "image/png";
    const quality = (options.quality || 85) / 100;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob as Blob | null), mimeType, quality);
    });

    // Add to ZIP with page number
    const extension =
      outputFormat === "jpg" || outputFormat === "jpeg" ? "jpg" : "png";
    const filename = `page-${pageNum.toString().padStart(3, "0")}.${extension}`;
    zip.file(filename, blob);
  }

  onProgress?.(95);

  // Generate ZIP
  const zipBlob = await zip.generateAsync({ type: "blob" });
  onProgress?.(100);

  return zipBlob;
}

/**
 * Extract text from PDF
 */
export async function pdfToText(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let allText = "";
  const numPages = pdf.numPages;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.((pageNum / numPages) * 100);

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: unknown) => (item as { str: string }).str)
      .join(" ");

    allText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
  }

  return new Blob([allText as any], { type: "text/plain" });
}

/**
 * Helper: Load image from file
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
