import { useState, useCallback } from "react";
import { useConversionStore } from "@/stores/conversionStore";
import { convertFile } from "@/converters";
import { addToHistory } from "@/lib/historyDB";
import type { ConversionOptions } from "@/types";

export function useConversion() {
  const { jobs, addJob, updateJob, removeJob } = useConversionStore();
  const [isConverting, setIsConverting] = useState(false);

  const startConversion = useCallback(
    async (
      file: File,
      inputFormat: string,
      outputFormat: string,
      options: ConversionOptions = {},
    ) => {
      // Add job to queue
      const jobId = addJob(file, inputFormat, outputFormat, options);

      try {
        // Update status to processing
        updateJob(jobId, { status: "processing", progress: 0 });

        // Perform conversion
        const result = await convertFile(
          file,
          inputFormat,
          outputFormat,
          options,
          (progress) => {
            updateJob(jobId, {
              progress,
              estimatedTimeRemaining:
                progress < 100
                  ? Math.round((100 - progress) * 100) // rough estimate
                  : 0,
            });
          },
        );

        // Update job with result
        updateJob(jobId, {
          status: "completed",
          progress: 100,
          result,
          estimatedTimeRemaining: 0,
        });

        // Add to history
        addToHistory({
          id: jobId,
          inputName: file.name,
          inputFormat,
          outputFormat,
          timestamp: Date.now(),
          fileSize: file.size,
          success: true,
        }).catch(console.error);
      } catch (error) {
        // Update job with error
        updateJob(jobId, {
          status: "failed",
          error: error instanceof Error ? error.message : "Conversion failed",
        });
      }
    },
    [addJob, updateJob],
  );

  const startBatchConversion = useCallback(
    async (
      conversions: Array<{
        file: File;
        inputFormat: string;
        outputFormat: string;
        options?: ConversionOptions;
      }>,
    ) => {
      setIsConverting(true);

      // Process conversions sequentially to avoid overwhelming the browser
      for (const conversion of conversions) {
        await startConversion(
          conversion.file,
          conversion.inputFormat,
          conversion.outputFormat,
          conversion.options || {},
        );
      }

      setIsConverting(false);
    },
    [startConversion],
  );

  return {
    jobs,
    isConverting,
    startConversion,
    startBatchConversion,
    removeJob,
  };
}
