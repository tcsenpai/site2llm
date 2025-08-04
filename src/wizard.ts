import type { GenerationOptions } from './types';
import { DEFAULT_OPTIONS, isValidUrl } from './utils';

export async function promptForUrl(): Promise<string> {
  console.log('\n🌐 Enter the website URL to generate llms.txt for:');
  process.stdout.write('URL: ');
  
  for await (const line of console) {
    const url = line.trim();
    
    if (!url) {
      process.stdout.write('Please enter a URL: ');
      continue;
    }
    
    if (!isValidUrl(url)) {
      process.stdout.write('Invalid URL format. Please try again: ');
      continue;
    }
    
    return url;
  }
  
  throw new Error('No URL provided');
}

export async function promptForOptions(): Promise<GenerationOptions> {
  console.log('\n⚙️  Configure generation options (press Enter for defaults):');
  
  const options: GenerationOptions = { ...DEFAULT_OPTIONS };
  
  // Max pages
  process.stdout.write(`Max pages (${DEFAULT_OPTIONS.maxPages}): `);
  for await (const line of console) {
    const input = line.trim();
    if (input) {
      const num = parseInt(input);
      if (num > 0) {
        options.maxPages = num;
      }
    }
    break;
  }
  
  // Max depth
  process.stdout.write(`Max depth (${DEFAULT_OPTIONS.maxDepth}): `);
  for await (const line of console) {
    const input = line.trim();
    if (input) {
      const num = parseInt(input);
      if (num > 0) {
        options.maxDepth = num;
      }
    }
    break;
  }
  
  // Format
  process.stdout.write(`Format - full/minimal (${DEFAULT_OPTIONS.format}): `);
  for await (const line of console) {
    const input = line.trim().toLowerCase();
    if (input === 'minimal' || input === 'full') {
      options.format = input as "full" | "minimal";
    }
    break;
  }
  
  return options;
}

export function askYesNo(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    process.stdout.write(`${question} (y/N): `);
    process.stdin.once('data', (data) => {
      const answer = data.toString().trim().toLowerCase();
      resolve(answer === 'y' || answer === 'yes');
    });
  });
}