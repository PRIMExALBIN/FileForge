import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadFile } from '@/utils/downloadUtils';

interface AudioPreviewProps {
    blob: Blob;
    filename: string;
}

export function AudioPreview({ blob, filename }: AudioPreviewProps) {
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [blob]);

    return (
        <div className="flex flex-col items-center justify-center p-8 gap-6 h-full bg-muted/20">
            <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">{filename}</h3>
                <p className="text-sm text-muted-foreground">
                    {(blob.size / 1024 / 1024).toFixed(2)} MB
                </p>
            </div>

            <audio
                controls
                className="w-full max-w-md"
                src={url}
            />

            <Button onClick={() => downloadFile(blob, filename)} className="gap-2">
                <Download className="w-4 h-4" />
                Download
            </Button>
        </div>
    );
}
