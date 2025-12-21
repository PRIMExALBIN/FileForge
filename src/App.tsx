import { useState, useEffect } from "react";
import { FileDropzone } from "@/components/FileDropzone/FileDropzone";
import { FormatSelector } from "@/components/FormatSelector/FormatSelector";
import { OptionsPanel } from "@/components/OptionsPanel/OptionsPanel";
import { ConversionQueue } from "@/components/ConversionQueue/ConversionQueue";
import { useTheme } from "@/hooks/useTheme";
import { useConversion } from "@/hooks/useConversion";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  Moon,
  Sun,
  Monitor,
  Zap,
  Settings,
  HelpCircle,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QUICK_CONVERT_SUGGESTIONS,
  getSuggestedFormats,
} from "@/utils/formatDetector";
import type { ConversionOptions } from "@/types";
import { HistoryModal } from "@/components/History/HistoryModal";
import { SettingsModal } from "@/components/Settings/SettingsModal";
import { HelpModal } from "@/components/Help/HelpModal";
import "./index.css";

interface PendingFile {
  file: File;
  format: string;
  outputFormat?: string;
  options: ConversionOptions;
}

function App() {
  const { theme, setTheme } = useTheme();
  const { startBatchConversion } = useConversion();

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Listen for custom events from shortcuts
  useEffect(() => {
    const openSettings = () => setIsSettingsOpen(true);
    const openHelp = () => setIsHelpOpen(true);

    document.addEventListener("open-settings", openSettings);
    document.addEventListener("open-help", openHelp);

    return () => {
      document.removeEventListener("open-settings", openSettings);
      document.removeEventListener("open-help", openHelp);
    };
  }, []);

  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [globalOutputFormat, setGlobalOutputFormat] = useState<string>("");
  const [globalOptions, setGlobalOptions] = useState<ConversionOptions>({
    quality: 85,
    maintainAspectRatio: true,
    backgroundColor: "#ffffff",
  });

  const handleFilesAdded = (files: Array<{ file: File; format: string }>) => {
    const newPending = files.map((item) => {
      // Auto-suggest output format
      const suggested = QUICK_CONVERT_SUGGESTIONS[item.format.toLowerCase()];
      const compatibleFormats = getSuggestedFormats(item.format);
      const defaultOutput = suggested || compatibleFormats[0] || "png";

      return {
        file: item.file,
        format: item.format,
        outputFormat: defaultOutput,
        options: { ...globalOptions },
      };
    });

    setPendingFiles((prev) => [...prev, ...newPending]);

    // Set global output format to first file's suggestion
    if (!globalOutputFormat && newPending.length > 0) {
      setGlobalOutputFormat(newPending[0].outputFormat || "");
    }
  };

  const handleConvertAll = async () => {
    if (pendingFiles.length === 0) return;

    const conversions = pendingFiles.map((item) => ({
      file: item.file,
      inputFormat: item.format,
      outputFormat: item.outputFormat || globalOutputFormat,
      options: item.options,
    }));

    await startBatchConversion(conversions);
    setPendingFiles([]); // Clear pending after starting conversions
  };

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FileForge
              </h1>
              <p className="text-xs text-muted-foreground">
                Universal File Converter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryOpen(true)}
              title="History"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings (Ctrl+,)"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHelpOpen(true)}
              title="Help (?)"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1"></div>
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              title="Toggle theme"
            >
              {getThemeIcon()}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Convert Any File Format
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fast, secure, and private. All conversions happen in your
              browser—no uploads required.
            </p>
          </div>

          {/* File Upload */}
          <FileDropzone onFilesAdded={handleFilesAdded} />

          {/* Pending Files - Format Selection */}
          {pendingFiles.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Ready to Convert ({pendingFiles.length})
                </h3>
                <Badge variant="secondary">
                  {pendingFiles.length} file
                  {pendingFiles.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Global Settings */}
                <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Batch Settings (applies to all)</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Output Format
                      </label>
                      <FormatSelector
                        inputFormat={pendingFiles[0]?.format || "png"}
                        value={globalOutputFormat}
                        onValueChange={(format) => {
                          setGlobalOutputFormat(format);
                          // Apply to all pending files
                          setPendingFiles((prev) =>
                            prev.map((item) => ({
                              ...item,
                              outputFormat: format,
                            })),
                          );
                        }}
                      />
                    </div>
                  </div>

                  <OptionsPanel
                    options={globalOptions}
                    onChange={(opts) => {
                      setGlobalOptions(opts);
                      // Apply to all pending files
                      setPendingFiles((prev) =>
                        prev.map((item) => ({ ...item, options: opts })),
                      );
                    }}
                  />
                </div>

                {/* File List */}
                <div className="space-y-2">
                  {pendingFiles.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.file.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {item.format.toUpperCase()}
                          </Badge>
                          <span>→</span>
                          <Badge variant="outline" className="text-xs">
                            {item.outputFormat?.toUpperCase() || "?"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setPendingFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Convert All Button */}
                <Button
                  onClick={handleConvertAll}
                  size="lg"
                  className="w-full"
                  disabled={!globalOutputFormat}
                >
                  ⚡ Convert All ({pendingFiles.length} files)
                </Button>
              </div>
            </Card>
          )}

          {/* Conversion Queue */}
          <ConversionQueue />

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-lg border bg-card/50 backdrop-blur">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                🔒
              </div>
              <h3 className="font-semibold mb-2">100% Private</h3>
              <p className="text-sm text-muted-foreground">
                Files never leave your device. Everything runs in your browser.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card/50 backdrop-blur">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                ⚡
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                No server uploads means instant conversions.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card/50 backdrop-blur">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                📦
              </div>
              <h3 className="font-semibold mb-2">200+ Formats</h3>
              <p className="text-sm text-muted-foreground">
                Images, documents, spreadsheets, and more.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with React + TypeScript • Powered by open-source libraries
          </p>
        </div>
      </footer>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;
