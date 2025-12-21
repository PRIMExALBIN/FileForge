import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagePreview } from "./ImagePreview";
import { TextPreview } from "./TextPreview";
import { DataPreview } from "./DataPreview";
import { AudioPreview } from "./AudioPreview";

interface PreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: Blob;
  format: string;
  filename: string;
}

export function Preview({
  isOpen,
  onClose,
  file,
  format,
  filename,
}: PreviewProps) {
  const renderPreview = () => {
    const imageFormats = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "ico"];
    const textFormats = ["txt", "md", "html", "css", "js", "ts", "tsx", "jsx"];
    const dataFormats = ["json", "yaml", "yml", "xml", "csv"];
    const audioFormats = ["mp3", "wav", "ogg", "aac", "m4a", "flac", "opus"];

    if (imageFormats.includes(format.toLowerCase())) {
      return <ImagePreview blob={file} filename={filename} />;
    } else if (textFormats.includes(format.toLowerCase())) {
      return <TextPreview blob={file} />;
    } else if (dataFormats.includes(format.toLowerCase())) {
      return <DataPreview blob={file} format={format} />;
    } else if (audioFormats.includes(format.toLowerCase())) {
      return <AudioPreview blob={file} filename={filename} />;
    } else {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <p>Preview not available for {format.toUpperCase()} files</p>
          <p className="text-sm mt-2">
            File size: {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{filename}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  );
}
