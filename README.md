# Amp Prospector

AI-powered sales discovery agent that generates comprehensive research materials for target companies using the [Amp SDK](https://ampcode.com/manual/sdk).

## What It Does

Prospector automates sales research by generating 8 detailed markdown files for any target company:

1. **Account Brief** - Company overview, business model, and customer segments
2. **Organization & Contacts** - Key personas, buying committee, and decision-makers
3. **Tech Stack** - Technology infrastructure, job signals, and gaps
4. **Initiatives & Triggers** - Strategic initiatives and timing opportunities
5. **Competition & Landscape** - Competitive positioning and market analysis
6. **Call Plan & Talk Track** - Discovery questions and demo storyline
7. **Discovery Framework** - Structured conversation framework
8. **Custom Demo** - Tailored Amp demo with prospect-specific use cases

## Requirements

- **Node.js** >= 18.19.0
- **AMP_API_KEY** - Get yours at [ampcode.com/settings/keys](https://ampcode.com/settings/keys)

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/sjarmak/amp-prospector.git
cd amp-prospector
npm install
```

### 2. Configure API Key

```bash
cp .env.example .env
# Edit .env and add your AMP_API_KEY
```

Or set it directly in your shell:

```bash
export AMP_API_KEY=sgamp_your_api_key_here
```

### 3. Run the Agent

```bash
npx tsx ./src/execute-agent.ts "Company name or website"
```

### Examples

```bash
# Research by company name
npx tsx ./src/execute-agent.ts "Shopify"

# Research by domain
npx tsx ./src/execute-agent.ts "stripe.com"

# With debug logging
DEBUG=1 npx tsx ./src/execute-agent.ts "Databricks"
```

## Output

Discovery files are written to `./discovery/<company-slug>/`:

```
discovery/
└── shopify/
    ├── 01_account_brief.md
    ├── 02_org_and_contacts.md
    ├── 03_tech_stack.md
    ├── 04_initiatives_and_triggers.md
    ├── 05_competition_and_landscape.md
    ├── 06_call_plan_and_talk_track.md
    ├── 07_discovery_framework.md
    └── 08_custom_demo.md
```

All files include YAML frontmatter with metadata and structured content with citations.

## How It Works

Prospector uses the Amp SDK to orchestrate three phases:

### Phase 1: Research
- Uses `web_search` and `read_web_page` tools via Amp SDK
- Gathers company information, recent initiatives, and tech signals
- Researches Amp capabilities from official documentation
- Produces a structured JSON research bundle

### Phase 2: Synthesis
- Processes research data through Amp SDK
- Generates 8 comprehensive markdown files
- Includes prospect-specific insights and recommendations
- Validates output structure and completeness

### Phase 3: Write
- Validates YAML frontmatter in all files
- Writes files to `./discovery/<company-slug>/`
- Ensures all 8 required files are present

## Configuration

### Environment Variables

- `AMP_API_KEY` (required) - Your Amp API key
- `DEBUG=1` (optional) - Enable verbose logging

### Advanced Usage

You can customize the research by modifying the `ProspectorInput` type in `src/types.ts`:

```typescript
{
  company: string           // Required: Company name or domain
  domains?: string[]        // Optional: Additional domains to research
  contacts?: string[]       // Optional: Specific contacts to research
  personas?: string[]       // Optional: Target personas (default: engineering leadership)
  objectives?: string[]     // Optional: Sales objectives
  timeframe?: string        // Optional: Research timeframe (default: "last 12 months")
  outDir?: string          // Optional: Custom output directory
}
```

## Architecture

```
src/
├── execute-agent.ts          # CLI entry point
├── orchestrator.ts           # Three-phase coordinator
├── types.ts                  # TypeScript interfaces
├── writeFiles.ts            # File writing and validation
├── research/
│   └── research.ts          # Research phase using Amp SDK
├── generate/
│   └── generate.ts          # Generation phase using Amp SDK
└── prompts/
    ├── systemProspector.ts   # System prompt for research quality
    ├── researchPrompt.ts     # Research phase instructions
    └── generationPrompt.ts   # Generation phase instructions
```

## Troubleshooting

### Missing AMP_API_KEY

```
Error: AMP_API_KEY environment variable is required
```

**Solution**: Create a `.env` file with your API key or export it:
```bash
export AMP_API_KEY=sgamp_your_key_here
```

### Not Exactly 8 Files

```
Error: Expected exactly 8 files, got X
```

**Solution**: The AI generation failed. Check your API key and try again. Enable `DEBUG=1` for more details.

### YAML Frontmatter Validation Error

```
Error: File X is missing YAML frontmatter
```

**Solution**: The generated file format is incorrect. This is rare but can happen. Try running again.

### Network or Rate Limit Issues

The agent makes multiple web searches and page reads. If you hit rate limits:
- Wait a few minutes and retry
- Check your Amp account for usage limits at [ampcode.com/settings](https://ampcode.com/settings)

## Development

### Project Structure

The agent follows the pattern from [amp-sample-jira-agent](https://github.com/Isuru-F/amp-sample-jira-agent), using:

- **Amp SDK** for AI orchestration and tool access
- **tsx** for direct TypeScript execution (no build step)
- **dotenv** for environment configuration

### Running Locally

```bash
# Install dependencies
npm install

# Run with debug logging
DEBUG=1 npx tsx ./src/execute-agent.ts "Test Company"

# Format and lint (if you add these tools)
npm run lint
npm run format
```

## Resources

- [Amp SDK Documentation](https://ampcode.com/manual/sdk)
- [Get an API Key](https://ampcode.com/settings/keys)
- [Amp Manual](https://ampcode.com/manual)
- [Example Agents](https://github.com/Isuru-F/amp-sample-jira-agent)

## License

MIT
