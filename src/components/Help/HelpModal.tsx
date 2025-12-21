import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileIcon,
  Music,
  Video,
  Image as ImageIcon,
  Archive,
  Sheet,
} from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const formats = [
    {
      category: "Images",
      icon: <ImageIcon className="w-4 h-4" />,
      formats: ["JPG", "PNG", "WEBP", "GIF", "BMP", "HEIC", "ICO", "TIFF"],
    },
    {
      category: "Documents",
      icon: <FileIcon className="w-4 h-4" />,
      formats: ["PDF", "DOCX", "TXT", "MD", "HTML"],
    },
    {
      category: "Audio",
      icon: <Music className="w-4 h-4" />,
      formats: ["MP3", "WAV", "OGG", "AAC", "M4A", "FLAC", "OPUS"],
    },
    {
      category: "Video",
      icon: <Video className="w-4 h-4" />,
      formats: ["MP4", "WEBM", "AVI", "MKV", "MOV"],
    },
    {
      category: "Spreadsheets",
      icon: <Sheet className="w-4 h-4" />,
      formats: ["XLSX", "CSV", "JSON", "XML", "YAML"],
    },
    {
      category: "Archives",
      icon: <Archive className="w-4 h-4" />,
      formats: ["ZIP (Extract Only)"],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
          <DialogDescription>
            FileForge is a secure, client-side file converter. Your files never
            leave your device.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2 space-y-6">
          {/* Supported Formats */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
              Supported Formats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formats.map((group) => (
                <div
                  key={group.category}
                  className="p-3 border rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {group.icon}
                    <span className="font-medium text-sm">
                      {group.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {group.formats.map((fmt) => (
                      <Badge
                        key={fmt}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {fmt}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shortcuts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-muted">
                <span>Open File</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">
                  Ctrl + O
                </kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted">
                <span>Paste File</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">
                  Ctrl + V
                </kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted">
                <span>Settings</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">
                  Ctrl + ,
                </kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted">
                <span>Help</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">
                  ?
                </kbd>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>Version 1.0.0 • Built with FFmpeg.wasm</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
