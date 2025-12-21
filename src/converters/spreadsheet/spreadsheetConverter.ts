import * as XLSX from "xlsx";
import type { ConversionOptions } from "@/types";

/**
 * Convert XLSX to CSV
 */
export async function xlsxToCSV(
  file: File,
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  onProgress?.(20);

  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(40);

  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  onProgress?.(60);

  // Get first sheet or specified sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  onProgress?.(100);

  return new Blob([csv], { type: "text/csv" });
}

/**
 * Convert CSV to XLSX
 */
export async function csvToXLSX(
  file: File,
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  onProgress?.(20);

  const text = await file.text();
  onProgress?.(40);

  const worksheet = XLSX.utils.aoa_to_sheet(
    text.split("\n").map((row) => row.split(",")),
  );
  onProgress?.(60);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const xlsxBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  onProgress?.(100);

  return new Blob([xlsxBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Convert XLSX to JSON
 */
export async function xlsxToJSON(
  file: File,
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  onProgress?.(20);

  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(40);

  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  onProgress?.(60);

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  const jsonString = JSON.stringify(jsonData, null, 2);
  onProgress?.(100);

  return new Blob([jsonString], { type: "application/json" });
}

/**
 * Convert JSON to XLSX
 */
export async function jsonToXLSX(
  file: File,
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  onProgress?.(20);

  const text = await file.text();
  const jsonData = JSON.parse(text);
  onProgress?.(40);

  // Handle both array of objects and single object
  const data = Array.isArray(jsonData) ? jsonData : [jsonData];

  const worksheet = XLSX.utils.json_to_sheet(data);
  onProgress?.(60);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const xlsxBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  onProgress?.(100);

  return new Blob([xlsxBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Convert CSV to JSON
 */
export async function csvToJSON(
  file: File,
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  onProgress?.(20);

  const text = await file.text();
  onProgress?.(40);

  const worksheet = XLSX.utils.aoa_to_sheet(
    text.split("\n").map((row) => row.split(",")),
  );
  onProgress?.(60);

  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  const jsonString = JSON.stringify(jsonData, null, 2);
  onProgress?.(100);

  return new Blob([jsonString], { type: "application/json" });
}

/**
 * Convert JSON to CSV
 */
export async function jsonToCSV(
  file: File,
  _options: ConversionOptions = {},
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  void _options;
  onProgress?.(20);

  const text = await file.text();
  const jsonData = JSON.parse(text);
  onProgress?.(40);

  // Handle both array and single object
  const data = Array.isArray(jsonData) ? jsonData : [jsonData];

  const worksheet = XLSX.utils.json_to_sheet(data);
  onProgress?.(60);

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  onProgress?.(100);

  return new Blob([csv], { type: "text/csv" });
}
