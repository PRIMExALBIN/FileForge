import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
    blob: Blob;
    filename: string;
}

export function ImagePreview({ blob, filename }: ImagePreviewProps) {
    const [zoom, setZoom] = useState(100);
    const imageUrl = useMemo(() => URL.createObjectURL(blob), [blob]);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => URL.revokeObjectURL(imageUrl);
    }, [imageUrl]);

    // Use img onLoad to set dimensions instead of synchronous effect
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        setImageDimensions({ width: target.naturalWidth, height: target.naturalHeight });
    };

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 400));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25));
    const handleFitToScreen = () => setZoom(100);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 100) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoom((prev) => Math.max(25, Math.min(400, prev + delta)));
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleZoomOut}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-mono w-16 text-center">{zoom}%</span>
                    <Button size="sm" variant="outline" onClick={handleZoomIn}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleFitToScreen}>
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>
                {imageDimensions && (
                    <div className="text-sm text-muted-foreground">
                        {imageDimensions.width} × {imageDimensions.height} •{' '}
                        {(blob.size / 1024).toFixed(1)} KB
                    </div>
                )}
            </div>

            {/* Image Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden bg-muted/20 flex items-center justify-center relative"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ cursor: zoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={filename}
                        draggable={false}
                        onLoad={handleImageLoad}
                        style={{
                            transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`,
                            transformOrigin: 'center',
                            transition: isDragging ? 'none' : 'transform 0.1s',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                        }}
                    />
                )}
            </div>
        </div>
    );
}
