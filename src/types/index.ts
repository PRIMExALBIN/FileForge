// Core conversion job interface
export interface ConversionJob {
  id: string;
  inputFile: File;
  inputFormat: string;
  outputFormat: string;
  options: ConversionOptions;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  result?: Blob | Blob[];
  error?: string;
  timestamp: number;
  completedAt?: number;
  estimatedTimeRemaining?: number;
}

// Conversion options (format-specific)
export interface ConversionOptions {
  // Image options
  quality?: number; // 1-100
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  rotate?: number; // degrees
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  backgroundColor?: string;
  stripExif?: boolean;

  // Document options
  pageRange?: string; // e.g., "1-5,8,10-12"
  compress?: boolean;
  password?: string;
  margins?: { top: number; right: number; bottom: number; left: number };

  // Audio options
  bitrate?: number; // kbps
  sampleRate?: number; // Hz
  channels?: "mono" | "stereo";
  normalize?: boolean;

  // Video options
  videoBitrate?: number;
  audioBitrate?: number;
  framerate?: number;
  resolution?: string; // e.g., "1920x1080"
  removeAudio?: boolean;
  trimStart?: number;
  trimEnd?: number;
  videoCodec?: string;

  // Archive options
  compressionLevel?: number; // 1-9
  archivePassword?: string;
}

// Format information
export interface FormatInfo {
  extension: string;
  name: string;
  category: FormatCategory;
  mimeTypes: string[];
  compatibleOutputs: string[];
  description?: string;
  supportsQuality?: boolean;
  supportsResize?: boolean;
  maxFileSize?: number; // bytes
}

export type FormatCategory =
  | "image"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "audio"
  | "video"
  | "archive"
  | "data"
  | "font"
  | "3d"
  | "subtitle"
  | "other";

// Format detection result
export interface FormatDetectionResult {
  extension: string;
  mimeType: string;
  category: FormatCategory;
  confidence: "high" | "medium" | "low";
  detectedBy: "magic-bytes" | "mime-type" | "extension";
}

// Conversion preset
export interface ConversionPreset {
  id: string;
  name: string;
  description: string;
  inputFormat: string | "any";
  outputFormat: string;
  options: ConversionOptions;
  category?: FormatCategory;
}

// User settings
export interface UserSettings {
  theme: "light" | "dark" | "system";
  defaultQuality: number;
  autoClearCompleted: boolean;
  autoClearDelay: number; // minutes
  showEstimatedTime: boolean;
  enableQuickConvert: boolean;
  defaultPresets: Record<string, string>; // format -> preset id
}

// Conversion history entry
export interface HistoryEntry {
  id: string;
  inputFormat: string;
  outputFormat: string;
  fileName: string;
  fileSize: number;
  outputSize: number;
  timestamp: number;
  duration: number; // ms
  options: ConversionOptions;
}

// File upload source
export type UploadSource = "drop" | "browse" | "paste" | "url";

// Converter function type
export type ConverterFunction = (
  file: File,
  outputFormat: string,
  options: ConversionOptions,
  onProgress?: (progress: number) => void,
) => Promise<Blob | Blob[]>;
