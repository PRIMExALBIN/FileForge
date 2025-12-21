import { getFFmpeg, fetchFile } from '@/lib/ffmpeg';
import type { ConversionOptions } from '@/types';

/**
 * Convert audio files using FFmpeg
 * Supports: MP3, WAV, OGG, AAC, M4A, FLAC, OPUS
 */
export async function convertAudio(
    file: File,
    inputFormat: string,
    outputFormat: string,
    options: ConversionOptions,
    onProgress: (progress: number) => void
): Promise<Blob> {
    // Initialize FFmpeg (lazy-loaded)
    const ffmpeg = await getFFmpeg((message) => {
        console.log('[Audio Converter]', message);
    });

    onProgress(5);

    const inputName = `input.${inputFormat}`;
    const outputName = `output.${outputFormat}`;

    // Write input file to FFmpeg virtual filesystem
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    onProgress(10);

    // Build FFmpeg command
    const args: string[] = ['-i', inputName];

    // Audio bitrate
    if (options.audioBitrate) {
        args.push('-b:a', `${options.audioBitrate}k`);
    } else {
        // Default bitrate based on format
        const defaultBitrates: Record<string, number> = {
            mp3: 192,
            aac: 192,
            m4a: 192,
            ogg: 192,
            opus: 128,
            flac: 0, // Lossless
            wav: 0,  // Uncompressed
        };
        const bitrate = defaultBitrates[outputFormat.toLowerCase()];
        if (bitrate > 0) {
            args.push('-b:a', `${bitrate}k`);
        }
    }

    // Sample rate
    if (options.sampleRate) {
        args.push('-ar', String(options.sampleRate));
    }

    // Channels (mono/stereo)
    if (options.channels) {
        args.push('-ac', options.channels === 'mono' ? '1' : '2');
    }

    // Normalize volume
    if (options.normalize) {
        args.push('-af', 'loudnorm');
    }

    // Trim start/end
    if (options.trimStart !== undefined && options.trimStart > 0) {
        args.push('-ss', String(options.trimStart));
    }
    if (options.trimEnd !== undefined && options.trimEnd > 0) {
        args.push('-to', String(options.trimEnd));
    }

    // Format-specific codec settings
    const format = outputFormat.toLowerCase();
    switch (format) {
        case 'mp3':
            args.push('-codec:a', 'libmp3lame');
            break;
        case 'ogg':
            args.push('-codec:a', 'libvorbis');
            break;
        case 'opus':
            args.push('-codec:a', 'libopus');
            break;
        case 'aac':
        case 'm4a':
            args.push('-codec:a', 'aac');
            break;
        case 'flac':
            args.push('-codec:a', 'flac');
            break;
        case 'wav':
            args.push('-codec:a', 'pcm_s16le');
            break;
    }

    args.push(outputName);

    // Track conversion progress
    let progressReported = false;
    ffmpeg.on('progress', ({ progress }) => {
        progressReported = true;
        onProgress(10 + progress * 85);
    });

    // Execute conversion
    await ffmpeg.exec(args);

    // Ensure we report complete progress
    if (!progressReported) {
        onProgress(95);
    }

    // Read output file
    const data = await ffmpeg.readFile(outputName);
    onProgress(98);

    // Cleanup virtual filesystem
    try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
    } catch (e) {
        console.warn('Cleanup warning:', e);
    }

    onProgress(100);

    // Return as Blob with correct MIME type
    const mimeTypes: Record<string, string> = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        aac: 'audio/aac',
        m4a: 'audio/mp4',
        flac: 'audio/flac',
        opus: 'audio/opus',
    };

    return new Blob([data as any], { type: mimeTypes[format] || 'audio/mpeg' });
}
