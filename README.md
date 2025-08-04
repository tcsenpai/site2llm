# site2llm

A beautiful CLI tool to convert websites into LLM-friendly text format using the https://llmstxtgenerator.cc API.

## Credits

This tool is built as a client interface for the excellent [LLMs.txt Generator](https://llmstxtgenerator.cc) service. All the heavy lifting (website crawling, content extraction, and llms.txt generation) is done by their robust API.

**Special thanks to the creator(s) of llmstxtgenerator.cc for providing this valuable service to the community!**

## Installation

### 🚀 **Quick Install (Recommended)**

#### Option 1: Install Globally via npm/bun
```bash
# Using bun (fastest)
bun install -g site2llm

# Using npm
npm install -g site2llm

# Using yarn
yarn global add site2llm
```

Once installed globally, you can use the `site2llm` command anywhere:
```bash
site2llm generate https://example.com
site2llm validate https://example.com
```

#### Option 2: Run from Source
```bash
# Clone the repository
git clone github.com/tcsenpai/site2llm
cd site2llm

# Install dependencies
bun install

# Run directly
bun run src/index.ts generate https://example.com

# Or build and run
bun run build
bun dist/index.js generate https://example.com
```

#### Option 3: Local Install & Link
```bash
# In the project directory
bun install
bun run build
bun link

# Now you can use 'site2llm' globally
site2llm generate https://example.com
```

### 📋 **Requirements**
- **Bun** (recommended) or **Node.js** 18+
- Internet connection for API calls

## Usage

### Basic Usage

Generate llms.txt from a website:

```bash
# If installed globally
site2llm generate https://example.com

# If running from source
bun run src/index.ts generate https://example.com
```

### Options

- `-p, --max-pages <number>` - Maximum pages to crawl (default: 20)
- `-d, --max-depth <number>` - Maximum crawl depth (default: 2)  
- `-f, --format <type>` - Output format: full|summary|custom (default: full)
- `--no-metadata` - Exclude metadata
- `--include-images` - Include images
- `--no-links` - Exclude links
- `--ignore-robots` - Ignore robots.txt
- `-o, --output <file>` - Output file path (default: llms.txt)
- `--wizard` - Run interactive wizard

### Examples

```bash
# Basic generation
site2llm generate https://demos.sh

# With custom options
site2llm generate https://demos.sh -p 50 -d 3 -f summary -o my-site.txt

# Interactive wizard mode
site2llm generate --wizard

# Validate URL only
site2llm validate https://example.com
```

### Commands

- `generate [url]` - Generate llms.txt from a website
- `validate <url>` - Validate a website URL

## How it works

1. **URL Validation**: Validates the target URL and checks accessibility
2. **Job Initiation**: Starts the crawling job with specified options
3. **Progress Monitoring**: Polls job status and shows real-time progress
4. **Result Retrieval**: Downloads and saves the generated llms.txt file

## API Workflow

The tool follows this workflow with the llmstxtgenerator.cc API:

1. `POST /api/validate-url` - Validate URL
2. `POST /api/generate` - Start generation job
3. `GET /api/generate?jobId=...` - Poll for completion (every 2 seconds)
4. Save result when status is "completed"

## Features

### 🎨 **Enhanced User Experience**
- ✨ **Beautiful colored output** with styled sections and icons
- 📊 **Animated progress bars** with real-time crawling statistics
- 🎯 **Clear visual indicators** for success, warnings, and errors
- 📋 **Formatted tables** for validation results and configuration
- 🚀 **Professional CLI interface** with headers and sections

### 🔧 **Core Functionality**
- ✅ **Full URL validation** with detailed recommendations
- ⚡ **Real-time progress monitoring** with ETA and speed metrics
- 🛠️ **Configurable crawling options** (pages, depth, format, content types)
- 🧙‍♂️ **Interactive wizard mode** for guided setup
- 📁 **Custom output file paths** and naming
- 🏃‍♂️ **TypeScript support** with blazing-fast Bun runtime
- 🛡️ **Robust error handling** with helpful suggestions and timeout management

### 🖼️ **Visual Preview**

The enhanced CLI provides a beautiful, professional interface:

```
╭─────────────────────────────────────╮
│          🌐 site2llm CLI           │
╰─────────────────────────────────────╯

✅ URL is valid and accessible
┌─ Validation Details
├─ Status: 200 OK
├─ Content Type: text/html
├─ Content Length: 368483
├─ Robots.txt: Allowed
└─ Sitemaps: 1 found

💡 Recommendations:
   • Found 1 sitemap(s). This will help discover more pages efficiently.

━━━ STARTING GENERATION ━━━
🚀 Target: https://demos.sh/

┌─ Configuration
├─ Max pages: 20
├─ Max depth: 2
├─ Format: full
├─ Include metadata: ✓
├─ Include images: ✗
├─ Include links: ✓
└─ Respect robots.txt: ✓

⏳ Job started: job_1754317612605_lztkpkz62
Progress |████████████████████████████| 100% | 3/4 pages | ETA: 0s

✅ Generation completed in 30s!

┌─ Results
├─ File: enhanced-test.txt
├─ Size: 3,618 characters
└─ Speed: 121 chars/sec
```
