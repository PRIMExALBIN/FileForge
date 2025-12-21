import { create } from "zustand";
import type { ConversionJob, ConversionOptions } from "@/types";
import { generateId, estimateConversionTime } from "@/utils/fileUtils";

interface ConversionState {
  jobs: ConversionJob[];
  autoClearEnabled: boolean;
  autoClearDelay: number; // minutes
  addJob: (
    file: File,
    inputFormat: string,
    outputFormat: string,
    options: ConversionOptions,
  ) => string;
  updateJob: (id: string, updates: Partial<ConversionJob>) => void;
  removeJob: (id: string) => void;
  clearCompleted: () => void;
  getJob: (id: string) => ConversionJob | undefined;
  getCompletedJobs: () => ConversionJob[];
  getPendingJobs: () => ConversionJob[];
  setAutoClear: (enabled: boolean, delay?: number) => void;
}

export const useConversionStore = create<ConversionState>((set, get) => ({
  jobs: [],
  autoClearEnabled: true,
  autoClearDelay: 5, // 5 minutes default

  addJob: (file, inputFormat, outputFormat, options) => {
    const id = generateId();
    const estimatedTime = estimateConversionTime(
      file.size,
      inputFormat,
      outputFormat,
    );

    const job: ConversionJob = {
      id,
      inputFile: file,
      inputFormat,
      outputFormat,
      options,
      status: "queued",
      progress: 0,
      timestamp: Date.now(),
      estimatedTimeRemaining: estimatedTime,
    };

    set((state) => ({ jobs: [...state.jobs, job] }));
    return id;
  },

  updateJob: (id, updates) => {
    set((state) => ({
      jobs: state.jobs.map((job) => {
        if (job.id !== id) return job;

        const updatedJob = { ...job, ...updates };

        // Set completedAt timestamp when job completes
        if (updates.status === "completed" && !job.completedAt) {
          updatedJob.completedAt = Date.now();
        }

        return updatedJob;
      }),
    }));
  },

  removeJob: (id) => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.status !== "completed"),
    }));
  },

  getJob: (id) => {
    return get().jobs.find((job) => job.id === id);
  },

  getCompletedJobs: () => {
    return get().jobs.filter((job) => job.status === "completed");
  },

  getPendingJobs: () => {
    return get().jobs.filter(
      (job) => job.status === "queued" || job.status === "processing",
    );
  },

  setAutoClear: (enabled, delay) => {
    set({
      autoClearEnabled: enabled,
      ...(delay !== undefined && { autoClearDelay: delay }),
    });
  },
}));

// Auto-clear cleanup interval
if (typeof window !== "undefined") {
  setInterval(() => {
    const { jobs, autoClearEnabled, autoClearDelay, removeJob } =
      useConversionStore.getState();

    if (!autoClearEnabled) return;

    const now = Date.now();
    const expiryMs = autoClearDelay * 60 * 1000;

    jobs.forEach((job) => {
      if (
        job.status === "completed" &&
        job.completedAt &&
        now - job.completedAt > expiryMs
      ) {
        removeJob(job.id);
      }
    });
  }, 30000); // Check every 30 seconds
}
