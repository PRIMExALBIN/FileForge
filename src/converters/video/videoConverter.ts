import { getFFmpeg, fetchFile } from "@/lib/ffmpeg";
import type { ConversionOptions } from "@/types";

/**
 * Convert video files using FFmpeg
 * Supports: MP4, WEBM, AVI, MKV, MOV, GIF
 * Can also extract audio (video → MP3)
 */
export async function convertVideo(
  file: File,
  inputFormat: string,
  outputFormat: string,
  options: ConversionOptions,
  onProgress: (progress: number) => void,
): Promise<Blob> {
  const ffmpeg = await getFFmpeg((message) => {
    console.log("[Video Converter]", message);
  });

  onProgress(5);

  const inputName = `input.${inputFormat}`;
  const outputName = `output.${outputFormat}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  onProgress(10);

  const args: string[] = ["-i", inputName];

  // Trim video (start/end times in seconds)
  if (options.trimStart !== undefined && options.trimStart > 0) {
    args.push("-ss", String(options.trimStart));
  }
  if (options.trimEnd !== undefined && options.trimEnd > 0) {
    args.push("-to", String(options.trimEnd));
  }

  const format = outputFormat.toLowerCase();

  // Special handling for different output formats
  if (format === "gif") {
    // GIF conversion with optimization
    const fps = options.framerate || 10;
    const scale = options.width || 480;
    args.push(
      "-vf",
      `fps=${fps},scale=${scale}:-1:flags=lanczos`,
      "-loop",
      "0",
    );
  } else if (format === "mp3") {
    // Extract audio only
    args.push(
      "-vn", // No video
      "-codec:a",
      "libmp3lame",
      "-q:a",
      "2", // High quality
    );
    if (options.audioBitrate) {
      args.push("-b:a", `${options.audioBitrate}k`);
    }
  } else {
    // Standard video conversion

    // Resolution/scale
    if (options.resolution && options.resolution !== "original") {
      const resolutions: Record<string, string> = {
        "360p": "640:360",
        "480p": "854:480",
        "720p": "1280:720",
        "1080p": "1920:1080",
        "4k": "3840:2160",
      };
      const scale = resolutions[options.resolution];
      if (scale) {
        args.push("-vf", `scale=${scale}`);
      }
    } else if (options.width && options.height) {
      args.push("-vf", `scale=${options.width}:${options.height}`);
    }

    // Framerate
    if (options.framerate) {
      args.push("-r", String(options.framerate));
    }

    // Video codec
    if (options.videoCodec) {
      const codecs: Record<string, string> = {
        h264: "libx264",
        h265: "libx265",
        vp9: "libvpx-vp9",
      };
      args.push("-codec:v", codecs[options.videoCodec] || "libx264");
    } else {
      // Default codecs for each format
      switch (format) {
        case "mp4":
          args.push("-codec:v", "libx264");
          break;
        case "webm":
          args.push("-codec:v", "libvpx-vp9");
          break;
        case "avi":
          args.push("-codec:v", "mpeg4");
          break;
        default:
          // Let FFmpeg choose
          break;
      }
    }

    // Video bitrate
    if (options.videoBitrate) {
      args.push("-b:v", String(options.videoBitrate));
    }

    // Audio handling
    if (options.removeAudio) {
      args.push("-an"); // No audio
    } else if (options.audioBitrate) {
      args.push("-b:a", `${options.audioBitrate}k`);
    }
  }

  args.push(outputName);

  // Track progress
  let progressReported = false;
  ffmpeg.on("progress", ({ progress }) => {
    progressReported = true;
    onProgress(10 + progress * 85);
  });

  // Execute conversion
  await ffmpeg.exec(args);

  if (!progressReported) {
    onProgress(95);
  }

  // Read output
  const data = await ffmpeg.readFile(outputName);
  onProgress(98);

  // Cleanup
  try {
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);
  } catch (e) {
    console.warn("Cleanup warning:", e);
  }

  onProgress(100);

  // MIME types
  const mimeTypes: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    mov: "video/quicktime",
    gif: "image/gif",
    mp3: "audio/mpeg",
  };

  return new Blob([data as any], { type: mimeTypes[format] || "video/mp4" });
}
