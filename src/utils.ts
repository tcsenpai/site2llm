import type { GenerationOptions } from './types';

export const DEFAULT_OPTIONS: GenerationOptions = {
  maxPages: 20,
  maxDepth: 2,
  format: "full",
  includeMetadata: true,
  includeImages: false,
  includeLinks: true,
  respectRobots: true,
  delay: 1000,
  timeout: 30000,
  includePatterns: [],
  excludePatterns: [],
  filterMinWords: 50,
  maxContentLength: 2000,
};

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function formatProgress(current: number, total: number, percentage: number): string {
  if (total === 0) {
    return `Progress: ${percentage}% (initializing...)`;
  }
  return `Progress: ${percentage}% (${current}/${total} pages)`;
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}