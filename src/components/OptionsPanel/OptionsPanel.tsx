import React from 'react';
import { Card } from '@/components/ui/card';
import { Label, Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { ConversionOptions } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OptionsPanelProps {
    inputFormat: string;
    outputFormat: string;
    options: ConversionOptions;
    onChange: (options: ConversionOptions) => void;
}

export function OptionsPanel({
    inputFormat,
    outputFormat,
    options,
    onChange,
}: OptionsPanelProps) {
    const isImageFormat = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'ico'].includes(
        outputFormat.toLowerCase()
    );
    const isAudioFormat = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'opus', 'wma', 'aiff'].includes(
        outputFormat.toLowerCase()
    );
    const isVideoFormat = ['mp4', 'webm', 'avi', 'mkv', 'mov'].includes(
        outputFormat.toLowerCase()
    );

    const supportsQuality = ['jpg', 'jpeg', 'webp'].includes(outputFormat.toLowerCase());
    const needsBackground = ['jpg', 'jpeg', 'bmp'].includes(outputFormat.toLowerCase());
    const isGif = outputFormat.toLowerCase() === 'gif';

    if (!isImageFormat && !isAudioFormat && !isVideoFormat && !isGif) {
        return null;
    }

    return (
        <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                ⚙️ Conversion Options
                <Badge variant="secondary" className="text-xs">
                    {outputFormat.toUpperCase()}
                </Badge>
            </h3>

            {isImageFormat && (
                <div className="space-y-4">
                    {/* Quality Slider */}
                    {supportsQuality && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="quality">Quality</Label>
                                <span className="text-sm text-muted-foreground">
                                    {options.quality || 85}%
                                </span>
                            </div>
                            <input
                                id="quality"
                                type="range"
                                min="1"
                                max="100"
                                value={options.quality || 85}
                                onChange={(e) =>
                                    onChange({ ...options, quality: parseInt(e.target.value) })
                                }
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>
                    )}

                    {/* Resize Options */}
                    <div className="space-y-2">
                        <Label>Resize (optional)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Input
                                    type="number"
                                    placeholder="Width"
                                    value={options.width || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...options,
                                            width: e.target.value ? parseInt(e.target.value) : undefined,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    placeholder="Height"
                                    value={options.height || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...options,
                                            height: e.target.value ? parseInt(e.target.value) : undefined,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={options.maintainAspectRatio !== false}
                                onChange={(e) =>
                                    onChange({ ...options, maintainAspectRatio: e.target.checked })
                                }
                                className="rounded"
                            />
                            <span>Maintain aspect ratio</span>
                        </label>
                    </div>

                    {/* Background Color for JPG/BMP */}
                    {needsBackground && (
                        <div className="space-y-2">
                            <Label htmlFor="backgroundColor">
                                Background Color (for transparency)
                            </Label>
                            <div className="flex gap-2">
                                <input
                                    id="backgroundColor"
                                    type="color"
                                    value={options.backgroundColor || '#ffffff'}
                                    onChange={(e) =>
                                        onChange({ ...options, backgroundColor: e.target.value })
                                    }
                                    className="h-10 w-20 rounded border cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={options.backgroundColor || '#ffffff'}
                                    onChange={(e) =>
                                        onChange({ ...options, backgroundColor: e.target.value })
                                    }
                                    placeholder="#ffffff"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Audio Options */}
            {isAudioFormat && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bitrate</Label>
                            <Select
                                value={String(options.audioBitrate || 192)}
                                onValueChange={(value) =>
                                    onChange({ ...options, audioBitrate: Number(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Bitrate" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="64">64 kbps (Low)</SelectItem>
                                    <SelectItem value="128">128 kbps</SelectItem>
                                    <SelectItem value="192">192 kbps (Default)</SelectItem>
                                    <SelectItem value="256">256 kbps</SelectItem>
                                    <SelectItem value="320">320 kbps (High)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Sample Rate</Label>
                            <Select
                                value={String(options.sampleRate || 44100)}
                                onValueChange={(value) =>
                                    onChange({ ...options, sampleRate: Number(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sample Rate" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="22050">22,050 Hz</SelectItem>
                                    <SelectItem value="44100">44,100 Hz (CD)</SelectItem>
                                    <SelectItem value="48000">48,000 Hz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Channels</Label>
                        <Select
                            value={options.channels || 'stereo'}
                            onValueChange={(value: 'mono' | 'stereo') =>
                                onChange({ ...options, channels: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Channels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mono">Mono</SelectItem>
                                <SelectItem value="stereo">Stereo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Video Options */}
            {(isVideoFormat || isGif) && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Resolution</Label>
                            <Select
                                value={options.resolution || 'original'}
                                onValueChange={(value) =>
                                    onChange({ ...options, resolution: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Resolution" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="original">Original</SelectItem>
                                    <SelectItem value="360p">360p</SelectItem>
                                    <SelectItem value="480p">480p</SelectItem>
                                    <SelectItem value="720p">720p (HD)</SelectItem>
                                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Framerate</Label>
                            <Select
                                value={String(options.framerate || 30)}
                                onValueChange={(value) =>
                                    onChange({ ...options, framerate: Number(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Framerate" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 fps</SelectItem>
                                    <SelectItem value="24">24 fps (Film)</SelectItem>
                                    <SelectItem value="30">30 fps</SelectItem>
                                    <SelectItem value="60">60 fps</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Video Codec - Only for video containers */}
                    {!isGif && (
                        <div className="space-y-2">
                            <Label>Video Codec</Label>
                            <Select
                                value={options.videoCodec || 'h264'}
                                onValueChange={(value) =>
                                    onChange({ ...options, videoCodec: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Codec" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="h264">H.264 (Standard)</SelectItem>
                                    <SelectItem value="h265">H.265 (High Efficiency)</SelectItem>
                                    <SelectItem value="vp9">VP9 (Web)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {!isGif && outputFormat !== 'mp3' && (
                        <label className="flex items-center gap-2 text-sm mt-2">
                            <input
                                type="checkbox"
                                checked={options.removeAudio || false}
                                onChange={(e) =>
                                    onChange({ ...options, removeAudio: e.target.checked })
                                }
                                className="rounded"
                            />
                            <span>Remove Audio</span>
                        </label>
                    )}
                </div>
            )}
        </Card>
    );
}
