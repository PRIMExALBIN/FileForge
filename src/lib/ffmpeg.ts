import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let isLoading = false;
let isLoaded = false;

/**
 * Get or initialize FFmpeg instance
 * Downloads ~31MB on first use
 */
export async function getFFmpeg(
  onProgress?: (message: string) => void,
): Promise<FFmpeg> {
  if (ffmpeg && isLoaded) return ffmpeg;

  if (isLoading) {
    // Wait for existing load to complete
    while (isLoading) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return ffmpeg!;
  }

  isLoading = true;
  onProgress?.("Initializing FFmpeg...");

  ffmpeg = new FFmpeg();

  // Log events
  ffmpeg.on("log", ({ message }) => {
    console.log("[FFmpeg]", message);
  });

  // Progress tracking
  ffmpeg.on("progress", ({ progress }) => {
    const percent = Math.round(progress * 100);
    console.log(`[FFmpeg Progress] ${percent}%`);
  });

  try {
    onProgress?.("Downloading FFmpeg core (~31MB, one-time only)...");

    // Load FFmpeg core from CDN
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });

    isLoaded = true;
    onProgress?.("FFmpeg loaded successfully!");
  } catch (error) {
    isLoading = false;
    isLoaded = false;
    throw new Error(
      `Failed to load FFmpeg: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  } finally {
    isLoading = false;
  }

  return ffmpeg;
}

export { fetchFile };
