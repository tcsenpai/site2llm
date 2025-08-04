export interface ValidationResponse {
  valid: boolean;
  normalizedUrl: string;
  isAccessible: boolean;
  responseInfo: {
    status: number;
    statusText: string;
    contentType: string;
    contentLength: string;
  };
  robotsInfo: {
    allowed: boolean;
    hasSitemaps: boolean;
    sitemapCount: number;
  };
  recommendations: string[];
}

export interface GenerationOptions {
  maxPages: number;
  maxDepth: number;
  format: "full" | "summary";
  includeMetadata: boolean;
  includeImages: boolean;
  includeLinks: boolean;
  respectRobots: boolean;
  delay: number;
  timeout: number;
  includePatterns: string[];
  excludePatterns: string[];
  filterMinWords: number;
  maxContentLength: number;
}

export interface JobStartResponse {
  jobId: string;
  status: "started";
  message: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: "running" | "completed" | "failed";
  progress: number;
  totalPages: number;
  scrapedPages: number;
  createdAt: string;
  updatedAt: string;
  result?: string; // The generated llms.txt content when completed
  error?: string; // Error message if failed
}