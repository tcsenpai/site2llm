import chalk from 'chalk';
import { SingleBar, Presets } from 'cli-progress';
import ora from 'ora';
import type { ValidationResponse, JobStatusResponse } from './types';

export class UIManager {
  private progressBar: SingleBar | null = null;
  private spinner: any = null;

  // Color theme
  private colors = {
    primary: chalk.cyan,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    info: chalk.blue,
    muted: chalk.gray,
    highlight: chalk.magenta,
    accent: chalk.white.bold,
  };

  // Icons
  private icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    rocket: '🚀',
    globe: '🌐',
    clock: '⏳',
    chart: '📊',
    file: '📄',
    magnify: '🔍',
    bulb: '💡',
    gear: '⚙️',
    checkmark: '✓',
    cross: '✗',
  };

  showHeader() {
    console.log(chalk.cyan.bold('\n╭─────────────────────────────────────╮'));
    console.log(chalk.cyan.bold('│          🌐 site2llm CLI           │'));
    console.log(chalk.cyan.bold('╰─────────────────────────────────────╯\n'));
  }

  showSection(title: string) {
    console.log(this.colors.accent(`\n━━━ ${title.toUpperCase()} ━━━`));
  }

  showValidating(url: string) {
    this.spinner = ora({
      text: this.colors.info(`Validating ${this.colors.highlight(url)}`),
      spinner: 'dots'
    }).start();
  }

  showValidationResult(validation: ValidationResponse) {
    if (this.spinner) {
      this.spinner.stop();
    }

    if (validation.valid && validation.isAccessible) {
      console.log(`${this.icons.success} ${this.colors.success('URL is valid and accessible')}`);
    } else {
      console.log(`${this.icons.error} ${this.colors.error('URL validation failed')}`);
      return;
    }

    // Show validation details in a nice format
    console.log(this.colors.muted('┌─ Validation Details'));
    console.log(this.colors.muted('├─') + ` Status: ${this.colors.success(validation.responseInfo.status + ' ' + validation.responseInfo.statusText)}`);
    console.log(this.colors.muted('├─') + ` Content Type: ${this.colors.info(validation.responseInfo.contentType)}`);
    console.log(this.colors.muted('├─') + ` Content Length: ${this.colors.info(validation.responseInfo.contentLength)}`);
    console.log(this.colors.muted('├─') + ` Robots.txt: ${validation.robotsInfo.allowed ? this.colors.success('Allowed') : this.colors.error('Blocked')}`);
    console.log(this.colors.muted('└─') + ` Sitemaps: ${this.colors.info(validation.robotsInfo.sitemapCount.toString())} found`);

    if (validation.recommendations.length > 0) {
      console.log(`\n${this.icons.bulb} ${this.colors.highlight('Recommendations:')}`);
      validation.recommendations.forEach(rec => {
        console.log(`   ${this.colors.muted('•')} ${this.colors.info(rec)}`);
      });
    }
  }

  showGenerationStart(url: string, options: any) {
    this.showSection('Starting Generation');
    console.log(`${this.icons.rocket} ${this.colors.primary('Target:')} ${this.colors.highlight(url)}`);
    
    console.log('\n' + this.colors.muted('┌─ Configuration'));
    console.log(this.colors.muted('├─') + ` Max pages: ${this.colors.accent(options.maxPages)}`);
    console.log(this.colors.muted('├─') + ` Max depth: ${this.colors.accent(options.maxDepth)}`);
    console.log(this.colors.muted('├─') + ` Format: ${this.colors.accent(options.format)}`);
    console.log(this.colors.muted('├─') + ` Include metadata: ${options.includeMetadata ? this.colors.success(this.icons.checkmark) : this.colors.error(this.icons.cross)}`);
    console.log(this.colors.muted('├─') + ` Include images: ${options.includeImages ? this.colors.success(this.icons.checkmark) : this.colors.error(this.icons.cross)}`);
    console.log(this.colors.muted('├─') + ` Include links: ${options.includeLinks ? this.colors.success(this.icons.checkmark) : this.colors.error(this.icons.cross)}`);
    console.log(this.colors.muted('└─') + ` Respect robots.txt: ${options.respectRobots ? this.colors.success(this.icons.checkmark) : this.colors.error(this.icons.cross)}`);
  }

  showJobStarted(jobId: string) {
    console.log(`\n${this.icons.clock} ${this.colors.primary('Job started:')} ${this.colors.muted(jobId)}`);
  }

  initProgressBar() {
    this.progressBar = new SingleBar({
      format: 'Progress |{bar}| {percentage}% | {value}/{total} pages | ETA: {eta}s',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true
    }, Presets.shades_classic);
  }

  updateProgress(status: JobStatusResponse, startTime: number) {
    if (!this.progressBar) {
      this.initProgressBar();
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    if (status.totalPages > 0) {
      if (!this.progressBar!.isActive) {
        this.progressBar!.start(status.totalPages, status.scrapedPages);
      }
      this.progressBar!.update(status.scrapedPages);
    } else {
      // Show spinner for initialization phase
      if (!this.spinner || !this.spinner.isSpinning) {
        this.spinner = ora({
          text: this.colors.info(`Initializing crawl... (${elapsed}s)`),
          spinner: 'dots'
        }).start();
      } else {
        this.spinner.text = this.colors.info(`Initializing crawl... (${elapsed}s)`);
      }
    }
  }

  showCompletion(totalTime: number, outputFile: string, contentLength: number) {
    if (this.progressBar) {
      this.progressBar.stop();
    }
    if (this.spinner) {
      this.spinner.stop();
    }

    console.log(`\n${this.icons.success} ${this.colors.success(`Generation completed in ${totalTime}s!`)}`);
    
    console.log('\n' + this.colors.muted('┌─ Results'));
    console.log(this.colors.muted('├─') + ` File: ${this.colors.highlight(outputFile)}`);
    console.log(this.colors.muted('├─') + ` Size: ${this.colors.accent(contentLength.toLocaleString())} characters`);
    console.log(this.colors.muted('└─') + ` Speed: ${this.colors.info((contentLength / totalTime).toFixed(0))} chars/sec`);
  }

  showError(message: string, details?: string) {
    if (this.progressBar) {
      this.progressBar.stop();
    }
    if (this.spinner) {
      this.spinner.stop();
    }

    console.log(`\n${this.icons.error} ${this.colors.error('Error:')} ${message}`);
    if (details) {
      console.log(this.colors.muted(`   ${details}`));
    }
  }

  showWarning(message: string) {
    console.log(`${this.icons.warning} ${this.colors.warning('Warning:')} ${message}`);
  }

  showInfo(message: string) {
    console.log(`${this.icons.info} ${this.colors.info(message)}`);
  }

  showSuccess(message: string) {
    console.log(`${this.icons.success} ${this.colors.success(message)}`);
  }

  // Validation display for the validate command
  showValidationCommand(validation: ValidationResponse) {
    this.showHeader();
    this.showSection('URL Validation Results');
    
    console.log(`${this.colors.primary('URL:')} ${this.colors.highlight(validation.normalizedUrl)}`);
    
    const statusColor = validation.valid && validation.isAccessible ? this.colors.success : this.colors.error;
    console.log(`${this.colors.primary('Status:')} ${statusColor(validation.valid && validation.isAccessible ? 'Valid & Accessible' : 'Invalid or Inaccessible')}`);
    
    console.log('\n' + this.colors.muted('┌─ Technical Details'));
    console.log(this.colors.muted('├─') + ` HTTP Status: ${this.colors.info(validation.responseInfo.status + ' ' + validation.responseInfo.statusText)}`);
    console.log(this.colors.muted('├─') + ` Content Type: ${this.colors.info(validation.responseInfo.contentType)}`);
    console.log(this.colors.muted('├─') + ` Content Length: ${this.colors.info(validation.responseInfo.contentLength)}`);
    console.log(this.colors.muted('├─') + ` Robots.txt: ${validation.robotsInfo.allowed ? this.colors.success('Crawling allowed') : this.colors.error('Crawling blocked')}`);
    console.log(this.colors.muted('└─') + ` Sitemaps: ${this.colors.info(validation.robotsInfo.sitemapCount + ' found')}`);

    if (validation.recommendations.length > 0) {
      console.log(`\n${this.icons.bulb} ${this.colors.highlight('Recommendations:')}`);
      validation.recommendations.forEach(rec => {
        console.log(this.colors.muted('   •') + ` ${this.colors.info(rec)}`);
      });
    }
  }
}