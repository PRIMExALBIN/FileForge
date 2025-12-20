import React, { useState } from 'react';
import type { ConversionJob } from '@/types';
import { useConversionStore } from '@/stores/conversionStore';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Download,
    X,
    Eye,
    FileImage,
    FileText,
    File,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Clock
} from 'lucide-react';
import { formatFileSize, formatTime } from '@/utils/fileUtils';
import { downloadFile, generateOutputFilename } from '@/utils/downloadUtils';
import { copyBlobToClipboard, supportsClipboardCopy } from '@/utils/fileUtils';
import { Preview } from '@/components/Preview/Preview';

interface ConversionJobCardProps {
    job: ConversionJob;
}

export function ConversionJobCard({ job }: ConversionJobCardProps) {
    const { removeJob, updateJob } = useConversionStore();
    const [showPreview, setShowPreview] = useState(false);

    const handleDownload = () => {
        if (!job.result) return;

        // Build correct filename: original name + new extension
        const originalName = job.inputFile.name;
        const lastDotIndex = originalName.lastIndexOf('.');
        const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
        const outputFilename = `${baseName}.${job.outputFormat}`;

        downloadFile(job.result, outputFilename);
    };

    const handleCopyToClipboard = async () => {
        if (job.result && supportsClipboardCopy(job.outputFormat)) {
            try {
                await copyBlobToClipboard(job.result);
                // TODO: Add toast notification
                console.log('Copied to clipboard!');
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
            }
        }
    };

    const handleCancel = () => {
        removeJob(job.id);
    };

    const getFileIcon = () => {
        const category = job.inputFormat;
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic'].includes(category)) {
            return <FileImage className="w-5 h-5" />;
        } else if (['pdf', 'docx', 'txt', 'md'].includes(category)) {
            return <FileText className="w-5 h-5" />;
        }
        return <File className="w-5 h-5" />;
    };

    const getStatusIcon = () => {
        switch (job.status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-destructive" />;
            case 'processing':
                return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
            default:
                return <Clock className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getStatusBadge = () => {
        switch (job.status) {
            case 'completed':
                return <Badge variant="success">Complete</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'processing':
                return <Badge variant="default">Converting...</Badge>;
            default:
                return <Badge variant="secondary">Queued</Badge>;
        }
    };

    const shouldShowCopyButton =
        job.status === 'completed' &&
        job.result &&
        supportsClipboardCopy(job.outputFormat);

    return (
        <>
            <Card className="p-4 transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {getFileIcon()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{job.inputFile.name}</h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <span>{formatFileSize(job.inputFile.size)}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-xs">
                                            {job.inputFormat.toUpperCase()}
                                        </Badge>
                                        <span>→</span>
                                        <Badge variant="outline" className="text-xs">
                                            {job.outputFormat.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                                {getStatusIcon()}
                                {getStatusBadge()}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {job.status === 'processing' && (
                            <div className="space-y-2">
                                <Progress value={job.progress} className="h-2" />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{job.progress}%</span>
                                    {job.estimatedTimeRemaining && (
                                        <span>~{formatTime(job.estimatedTimeRemaining)} remaining</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {job.status === 'failed' && job.error && (
                            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                                {job.error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                            {job.status === 'completed' && job.result && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={handleDownload}
                                        className="gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </Button>

                                    {shouldShowCopyButton && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCopyToClipboard}
                                            className="gap-2"
                                        >
                                            📋 Copy
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowPreview(true)}
                                        className="gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCancel}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </>
                            )}

                            {(job.status === 'queued' || job.status === 'processing') && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancel}
                                    className="gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                            )}

                            {job.status === 'failed' && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            // TODO: Implement retry logic
                                            console.log('Retry conversion');
                                        }}
                                    >
                                        Retry
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCancel}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Preview Modal */}
            {
                job.result && (
                    <Preview
                        isOpen={showPreview}
                        onClose={() => setShowPreview(false)}
                        file={job.result}
                        format={job.outputFormat}
                        filename={generateOutputFilename(job.inputFile.name, job.outputFormat)}
                    />
                )
            }
        </>);
}
