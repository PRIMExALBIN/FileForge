import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextPreviewProps {
    blob: Blob;
}

export function TextPreview({ blob }: TextPreviewProps) {
    const [text, setText] = useState('');
    const [wordWrap, setWordWrap] = useState(true);

    useEffect(() => {
        blob.text().then(setText);
    }, [blob]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        // TODO: Add toast notification
        console.log('Copied to clipboard!');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={wordWrap}
                            onChange={(e) => setWordWrap(e.target.checked)}
                            className="rounded"
                        />
                        Word wrap
                    </label>
                </div>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text
                </Button>
            </div>

            {/* Text Content */}
            <div className="flex-1 overflow-auto p-4 bg-muted/20">
                <pre
                    className={cn(
                        'text-sm font-mono',
                        wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
                    )}
                >
                    {text}
                </pre>
            </div>
        </div>
    );
}

// Import cn utility
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
