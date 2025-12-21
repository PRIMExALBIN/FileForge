import React, { useState, useRef, useCallback } from 'react';
import { Upload, Link as LinkIcon, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { detectFormat } from '@/utils/formatDetector';
import { validateFileSize } from '@/utils/fileUtils';

interface FileDropzoneProps {
    onFilesAdded: (files: Array<{ file: File; format: string }>) => void;
    className?: string;
}

export function FileDropzone({ onFilesAdded, className }: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [showUrlDialog, setShowUrlDialog] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file drop
    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            const droppedFiles = Array.from(e.dataTransfer.files);
            await processFiles(droppedFiles);
        },
        [processFiles]
    );

    // Handle file selection via browse
    const handleFileInput = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
            await processFiles(selectedFiles);

            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [processFiles]
    );

    // Process and validate files
    const processFiles = useCallback(async (files: File[]) => {
        const processedFiles: Array<{ file: File; format: string }> = [];

        for (const file of files) {
            // Validate file size
            const validation = validateFileSize(file);
            if (!validation.valid) {
                console.error(`Skipping ${file.name}: ${validation.error}`);
                continue;
            }

            // Detect format
            const detection = await detectFormat(file);
            processedFiles.push({
                file,
                format: detection.extension,
            });
        }

        if (processedFiles.length > 0) {
            onFilesAdded(processedFiles);
        }
    }, [onFilesAdded]);

    // Handle paste from clipboard
    const handlePaste = useCallback(
        async (e: React.ClipboardEvent) => {
            const items = e.clipboardData.items;
            const files: File[] = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                }
            }

            if (files.length > 0) {
                await processFiles(files);
            }
        },
        [processFiles]
    );

    // Handle URL import
    const handleUrlImport = async () => {
        if (!urlInput.trim()) return;

        setIsLoadingUrl(true);
        try {
            const response = await fetch(urlInput);
            if (!response.ok) throw new Error('Failed to fetch file from URL');

            const blob = await response.blob();
            const filename = getFilenameFromUrl(urlInput) || 'imported-file';
            const file = new File([blob], filename, { type: blob.type });

            await processFiles([file]);
            setUrlInput('');
            setShowUrlDialog(false);
        } catch (error) {
            console.error('URL import failed:', error);
            alert('Failed to import file from URL. Please check the URL and try again.');
        } finally {
            setIsLoadingUrl(false);
        }
    };

    // Extract filename from URL
    const getFilenameFromUrl = (url: string): string | null => {
        try {
            const pathname = new URL(url).pathname;
            return pathname.split('/').pop() || null;
        } catch {
            return null;
        }
    };

    return (
        <div className={cn('w-full', className)}>
            <Card
                className={cn(
                    'relative overflow-hidden transition-all duration-200',
                    isDragging && 'border-primary border-2 bg-primary/5'
                )}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onPaste={handlePaste}
                tabIndex={0}
            >
                <div className="p-12 text-center">
                    <div className="flex justify-center mb-6">
                        <div
                            className={cn(
                                'w-20 h-20 rounded-full flex items-center justify-center transition-colors',
                                isDragging
                                    ? 'bg-primary/20'
                                    : 'bg-gradient-to-br from-primary/10 to-accent/10'
                            )}
                        >
                            <Upload
                                className={cn(
                                    'w-10 h-10 transition-colors',
                                    isDragging ? 'text-primary' : 'text-muted-foreground'
                                )}
                            />
                        </div>
                    </div>

                    <h3 className="text-2xl font-semibold mb-2">
                        Drop files here or click to browse
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Supports 200+ formats • Up to 2GB per file
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                            variant="default"
                            size="lg"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mr-2" /> Browse Files
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                                const clipboardText = document.createElement('input');
                                clipboardText.focus();
                                document.execCommand('paste');
                            }}
                        >
                            <Clipboard className="mr-2" /> Paste
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setShowUrlDialog(!showUrlDialog)}
                        >
                            <LinkIcon className="mr-2" /> Import URL
                        </Button>
                    </div>

                    {/* URL Import Dialog */}
                    {showUrlDialog && (
                        <div className="mt-6 p-4 border rounded-lg bg-card animate-slide-up">
                            <h4 className="font-medium mb-3">Import from URL</h4>
                            <div className="flex gap-2">
                                <Input
                                    type="url"
                                    placeholder="https://example.com/file.jpg"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
                                    disabled={isLoadingUrl}
                                />
                                <Button
                                    onClick={handleUrlImport}
                                    disabled={!urlInput.trim() || isLoadingUrl}
                                >
                                    {isLoadingUrl ? 'Loading...' : 'Import'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowUrlDialog(false);
                                        setUrlInput('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept="*/*"
                />
            </Card>
        </div>
    );
}
