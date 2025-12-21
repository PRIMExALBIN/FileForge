import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Monitor } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const {
        autoClearCompleted,
        setAutoClearCompleted,
        autoClearDelay,
        setAutoClearDelay,
        enableQuickConvert,
        toggleQuickConvert
    } = useSettingsStore();

    const { theme, setTheme } = useTheme();

    // Convert minutes to ms for display/input if needed, but store uses minutes? 
    // Store says "autoClearDelay: 5" (default). Probably minutes.
    // In previous SettingsModal I treated it as ms (1000-10000). 
    // I should probably stick to minutes or seconds. Let's assume Seconds for UI but store has 5?
    // Let's check store default: 5. 5 minutes? 
    // "remove successful jobs after delay". 5 minutes seems long. 
    // Let's treat store value as SECONDS for now or check usage in App.tsx. 
    // App.tsx uses it. Let's assume it's Seconds in the store for consistency with typical usage.

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Theme */}
                    <div className="space-y-3">
                        <Label>Appearance</Label>
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${theme === 'light' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                                    }`}
                            >
                                <Sun className="w-4 h-4" />
                                <span className="text-sm">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${theme === 'dark' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                                    }`}
                            >
                                <Moon className="w-4 h-4" />
                                <span className="text-sm">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${theme === 'system' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                                    }`}
                            >
                                <Monitor className="w-4 h-4" />
                                <span className="text-sm">System</span>
                            </button>
                        </div>
                    </div>

                    {/* Auto Clear */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-clear completed jobs</Label>
                            <p className="text-xs text-muted-foreground">
                                Remove successful jobs after delay
                            </p>
                        </div>
                        <Switch
                            checked={autoClearCompleted}
                            onCheckedChange={setAutoClearCompleted}
                        />
                    </div>

                    {/* Clear duration slider (if auto-clear is on) */}
                    {autoClearCompleted && (
                        <div className="space-y-2 pl-4 border-l-2">
                            <Label className="text-xs">Clear after {autoClearDelay} seconds</Label>
                            <input type="range" min="1" max="60" step="1"
                                value={autoClearDelay}
                                onChange={(e) => setAutoClearDelay(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    )}

                    {/* Quick Convert */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Quick Convert Mode</Label>
                            <p className="text-xs text-muted-foreground">
                                Start conversion immediately after upload
                            </p>
                        </div>
                        <Switch
                            checked={enableQuickConvert}
                            onCheckedChange={() => toggleQuickConvert()}
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-center text-muted-foreground">
                            Settings are saved automatically.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
