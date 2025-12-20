import React from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getSuggestedFormats, QUICK_CONVERT_SUGGESTIONS } from '@/utils/formatDetector';
import { FORMATS } from '@/constants/formats';
import type { FormatCategory } from '@/types';

interface FormatSelectorProps {
    inputFormat: string;
    value: string;
    onValueChange: (format: string) => void;
    className?: string;
}

export function FormatSelector({
    inputFormat,
    value,
    onValueChange,
    className,
}: FormatSelectorProps) {
    const compatibleFormats = getSuggestedFormats(inputFormat);

    // Get quick convert suggestion
    const quickSuggestion = QUICK_CONVERT_SUGGESTIONS[inputFormat.toLowerCase()];

    // Group formats by category
    const formatsByCategory: Record<string, string[]> = {};

    // Categorize compatible formats dynamically using registry
    compatibleFormats.forEach((format) => {
        const formatInfo = FORMATS[format.toLowerCase()];
        const category = formatInfo?.category || 'other';

        if (!formatsByCategory[category]) {
            formatsByCategory[category] = [];
        }
        formatsByCategory[category].push(format);
    });

    // Helper to render a group if it has items
    const renderGroup = (label: string, formats: string[]) => {
        if (!formats || formats.length === 0) return null;
        return (
            <>
                <SelectGroup>
                    <SelectLabel>{label}</SelectLabel>
                    {formats.map((format) => (
                        <SelectItem key={format} value={format}>
                            <span className="font-mono text-xs">{format.toUpperCase()}</span>
                        </SelectItem>
                    ))}
                </SelectGroup>
                <SelectSeparator />
            </>
        );
    };

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className={className}>
                <SelectValue placeholder="Select output format" />
            </SelectTrigger>
            <SelectContent>
                {/* Quick Suggestion */}
                {quickSuggestion && compatibleFormats.includes(quickSuggestion) && (
                    <>
                        <SelectGroup>
                            <SelectLabel>⭐ Recommended</SelectLabel>
                            <SelectItem value={quickSuggestion}>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs bg-primary/10 px-2 py-0.5 rounded">
                                        {quickSuggestion.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Most common</span>
                                </div>
                            </SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                    </>
                )}

                {renderGroup('🖼️ Images', formatsByCategory['image'])}
                {renderGroup('📄 Documents', formatsByCategory['document'])}
                {renderGroup('🎵 Audio', formatsByCategory['audio'])}
                {renderGroup('🎬 Video', formatsByCategory['video'])}
                {renderGroup('📊 Spreadsheets', formatsByCategory['spreadsheet'])}
                {renderGroup('📦 Archives', formatsByCategory['archive'])}
                {renderGroup('💾 Data', formatsByCategory['data'])}
                {renderGroup('Other', formatsByCategory['other'])}

                {/* Fallback: All formats if grouping somehow failed or empty */}
                {compatibleFormats.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No compatible formats available
                    </div>
                )}
            </SelectContent>
        </Select>
    );
}
