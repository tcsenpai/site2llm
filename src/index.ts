#!/usr/bin/env bun

import { Command } from 'commander';
import { LLMSTxtAPI } from './api';
import { DEFAULT_OPTIONS, isValidUrl } from './utils';
import { promptForUrl, promptForOptions, askYesNo } from './wizard';
import { UIManager } from './ui';
import type { GenerationOptions } from './types';

const program = new Command();
const api = new LLMSTxtAPI();
const ui = new UIManager();

program
  .name('site2llm')
  .description('Convert websites to LLM-friendly text format')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate llms.txt from a website')
  .argument('[url]', 'Website URL to process')
  .option('-p, --max-pages <number>', 'Maximum pages to crawl', '20')
  .option('-d, --max-depth <number>', 'Maximum crawl depth', '2')
  .option('-f, --format <type>', 'Output format (full|summary)', 'full')
  .option('--no-metadata', 'Exclude metadata')
  .option('--include-images', 'Include images')
  .option('--no-links', 'Exclude links')
  .option('--ignore-robots', 'Ignore robots.txt')
  .option('-o, --output <file>', 'Output file path')
  .option('--wizard', 'Run interactive wizard')
  .action(async (url: string | undefined, options) => {
    try {
      let targetUrl = url;
      let genOptions: GenerationOptions = {
        ...DEFAULT_OPTIONS,
        maxPages: parseInt(options.maxPages),
        maxDepth: parseInt(options.maxDepth),
        format: options.format as "full" | "summary",
        includeMetadata: options.metadata !== false,
        includeImages: options.includeImages === true,
        includeLinks: options.links !== false,
        respectRobots: options.ignoreRobots !== true,
      };

      // Interactive wizard mode
      if (options.wizard || !targetUrl) {
        if (!targetUrl) {
          targetUrl = await promptForUrl();
        }
        
        if (await askYesNo('🔧 Would you like to customize generation options?')) {
          genOptions = await promptForOptions();
        }
      }

      if (!targetUrl) {
        ui.showError('No URL provided', 'Use --wizard or provide URL as argument');
        process.exit(1);
      }

      if (!isValidUrl(targetUrl)) {
        ui.showError('Invalid URL format');
        process.exit(1);
      }

      ui.showHeader();
      ui.showValidating(targetUrl);
      
      // Validate URL
      const validation = await api.validateUrl(targetUrl);
      
      if (!validation.valid) {
        ui.showError('URL validation failed');
        process.exit(1);
      }

      if (!validation.isAccessible) {
        ui.showError('URL is not accessible');
        process.exit(1);
      }

      ui.showValidationResult(validation);
      ui.showGenerationStart(validation.normalizedUrl, genOptions);

      // Start generation
      const job = await api.startGeneration(validation.normalizedUrl, genOptions);
      ui.showJobStarted(job.jobId);

      const startTime = Date.now();

      // Wait for completion with progress updates
      const result = await api.waitForCompletion(job.jobId, (status) => {
        ui.updateProgress(status, startTime);
      });

      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      
      // Save result
      const outputFile = options.output || 'llms.txt';
      await Bun.write(outputFile, result);
      
      ui.showCompletion(totalTime, outputFile, result.length);

    } catch (error) {
      ui.showError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate a website URL')
  .argument('<url>', 'Website URL to validate')
  .action(async (url: string) => {
    try {
      if (!isValidUrl(url)) {
        ui.showError('Invalid URL format');
        process.exit(1);
      }

      const validation = await api.validateUrl(url);
      ui.showValidationCommand(validation);

    } catch (error) {
      ui.showError(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Default command
if (process.argv.length === 2) {
  program.parse(['node', 'script', 'generate', '--wizard']);
} else {
  program.parse();
}