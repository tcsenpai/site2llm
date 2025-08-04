import type { ValidationResponse, GenerationOptions, JobStartResponse, JobStatusResponse } from './types';

const API_BASE = 'https://llmstxtgenerator.cc/api';

export class LLMSTxtAPI {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateUrl(url: string): Promise<ValidationResponse> {
    return this.makeRequest<ValidationResponse>('/validate-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async startGeneration(url: string, options: GenerationOptions): Promise<JobStartResponse> {
    return this.makeRequest<JobStartResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify({ url, options }),
    });
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.makeRequest<JobStatusResponse>(`/generate?jobId=${jobId}`);
  }

  async waitForCompletion(jobId: string, onProgress?: (status: JobStatusResponse) => void): Promise<string> {
    const pollInterval = 2000; // 2 seconds
    const maxAttempts = 300; // 10 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.getJobStatus(jobId);
      
      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed') {
        if (status.result) {
          // The result might be an object with content property or just a string
          if (typeof status.result === 'object' && 'content' in status.result) {
            return status.result.content;
          }
          return typeof status.result === 'string' ? status.result : JSON.stringify(status.result);
        }
        throw new Error('Job completed but no result returned');
      }

      if (status.status === 'failed') {
        throw new Error(`Job failed: ${status.error || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error('Job timed out - exceeded maximum wait time');
  }
}