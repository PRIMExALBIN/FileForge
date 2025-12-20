import React from 'react';
import { useConversionStore } from '@/stores/conversionStore';
import { ConversionJobCard } from './ConversionJobCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Trash2 } from 'lucide-react';
import { downloadFilesAsZip } from '@/utils/downloadUtils';

export function ConversionQueue() {
    const { jobs, clearCompleted } = useConversionStore();

    const completedJobs = jobs.filter((job) => job.status === 'completed' && job.result);

    const handleDownloadAll = async () => {
        if (completedJobs.length === 0) return;

        const files = completedJobs.map((job) => {
            const originalName = job.inputFile.name;
            const lastDotIndex = originalName.lastIndexOf('.');
            const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;

            return {
                blob: Array.isArray(job.result) ? job.result[0] : job.result!,
                filename: `${baseName}.${job.outputFormat}`
            };
        });

        await downloadFilesAsZip(files, 'converted-files.zip');
    };

    // Empty state
    if (jobs.length === 0) {
        return (
            <Card className="p-12 text-center border-dashed">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-3xl">📁</span>
                    </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No files yet</h3>
                <p className="text-sm text-muted-foreground">
                    Upload files using the dropzone above to start converting
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        Conversion Queue ({jobs.length})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {completedJobs.length} completed
                    </p>
                </div>
                <div className="flex gap-2">
                    {completedJobs.length > 0 && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadAll}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download All as ZIP
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearCompleted}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear Completed
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Job List */}
            <div className="space-y-3">
                {jobs.map((job) => (
                    <ConversionJobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
}
