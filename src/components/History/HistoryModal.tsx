import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHistory, clearHistory } from "@/lib/historyDB";
import { formatFileSize } from "@/utils/fileUtils";
import { Trash2, Clock } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryItem {
  id: string;
  inputName: string;
  inputFormat: string;
  outputFormat: string;
  timestamp: number;
  fileSize: number;
  success: boolean;
  error?: string;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        const items = (await getHistory()) as HistoryItem[];
        setHistory(items.sort((a, b) => b.timestamp - a.timestamp));
      })();
    }
  }, [isOpen]);

  async function handleClear() {
    if (confirm("Clear all history?")) {
      await clearHistory();
      setHistory([]);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Recent Conversions</DialogTitle>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No clean history yet.</p>
            </div>
          ) : (
            history.map((item: any) => (
              <div
                key={item.id}
                className="p-3 bg-muted/30 rounded-lg border flex items-center justify-between"
              >
                <div className="space-y-1 overflow-hidden">
                  <p
                    className="font-medium truncate text-sm"
                    title={item.inputName}
                  >
                    {item.inputName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px] h-5 px-1">
                      {item.inputFormat.toUpperCase()}
                    </Badge>
                    <span>→</span>
                    <Badge variant="default" className="text-[10px] h-5 px-1">
                      {item.outputFormat.toUpperCase()}
                    </Badge>
                    <span>•</span>
                    <span>{formatFileSize(item.fileSize)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
