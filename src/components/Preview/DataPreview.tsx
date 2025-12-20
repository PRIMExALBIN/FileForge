import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataPreviewProps {
    blob: Blob;
    format: string;
}

export function DataPreview({ blob, format }: DataPreviewProps) {
    const [text, setText] = useState('');
    const [formatted, setFormatted] = useState('');

    useEffect(() => {
        blob.text().then((content) => {
            setText(content);

            // Format based on type
            try {
                if (format === 'json') {
                    const parsed = JSON.parse(content);
                    setFormatted(JSON.stringify(parsed, null, 2));
                } else {
                    setFormatted(content);
                }
            } catch {
                setFormatted(content);
            }
        });
    }, [blob, format]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        console.log('Copied to clipboard!');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="text-sm font-medium">
                    {format.toUpperCase()} Data
                </div>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                </Button>
            </div>

            {/* Data Content */}
            <div className="flex-1 overflow-auto p-4 bg-muted/20">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                    {formatted}
                </pre>
            </div>
        </div>
    );
}
