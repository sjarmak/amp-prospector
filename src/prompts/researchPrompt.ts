import type { ProspectorInput } from '../types.js'

export function researchPrompt(input: ProspectorInput): string {
	return `Research the company "${input.company}" to prepare sales discovery materials for Amp, an agentic AI coding assistant.

Company: ${input.company}
${input.domains ? `Known Domains: ${input.domains.join(', ')}` : ''}
${input.contacts ? `Known Contacts: ${input.contacts.join(', ')}` : ''}
${input.personas ? `Focus on roles: ${input.personas.join(', ')}` : 'Focus on: Engineering leadership (CTO, VP Eng, Director of Engineering)'}
${input.objectives ? `Sales Objectives: ${input.objectives.join(', ')}` : ''}
${input.timeframe ? `Research Timeframe: ${input.timeframe}` : 'Research Timeframe: last 12 months'}

Your task is to perform comprehensive research in three passes:

**Pass A: Company Basics**
- Use web_search to discover company website, blog, news, careers page
- Use read_web_page to extract company information
- Gather: business model, products, customer segments, size, funding, engineering challenges
- Identify potential pain points relevant to an AI coding tool

**Pass B: 12-Month Signals**
- Search for recent funding announcements, M&A activity, leadership changes
- Look for compliance/regulatory changes, product launches, engineering initiatives
- Identify strategic initiatives from job postings (especially engineering roles) and press releases
- Note any mentions of developer productivity, code quality, or engineering velocity

**Pass C: Amp Context**
- Research Amp's current capabilities ONLY from https://ampcode.com/manual
- Research recent Amp updates ONLY from https://ampcode.com/news
- DO NOT use any other sources for Amp information
- Focus on: key features, MCP integration, toolboxes, permissions, Oracle, subagents
- Extract specific use cases and examples with citations from ampcode.com

Output a single JSON object with this exact structure:

\`\`\`json
{
  "facts": [
    {
      "claim": "Specific factual claim",
      "citation": "Source URL or reference",
      "confidence": "high|medium|low",
      "date": "YYYY-MM-DD (optional)"
    }
  ],
  "timelines": [
    {
      "date": "YYYY-MM-DD",
      "event": "Description of event",
      "source": "Source URL"
    }
  ],
  "personas": [
    {
      "name": "Person Name (if known)",
      "role": "Job title",
      "responsibilities": ["Responsibility 1", "Responsibility 2"]
    }
  ],
  "techSignals": {
    "stack": ["Technology 1", "Technology 2"],
    "versions": {"tech-name": "version"},
    "gaps": ["Gap or need identified"]
  },
  "initiatives": [
    {
      "initiative": "Strategic initiative",
      "trigger": "Event that triggered it",
      "relevance": "Why this matters for Amp"
    }
  ],
  "competition": {
    "incumbents": ["Competitor 1", "Competitor 2"],
    "partners": ["Partner 1", "Partner 2"],
    "maturity": "Description of market maturity"
  },
  "ampCapabilities": [
    {
      "capability": "Capability name",
      "examples": ["Example use case 1", "Example use case 2"],
      "citations": ["https://ampcode.com/manual#section"]
    }
  ],
  "sources": [
    {
      "publisher": "Source name",
      "title": "Article or page title",
      "url": "https://...",
      "date": "YYYY-MM-DD (optional)"
    }
  ]
}
\`\`\`

Important:
- Include citations for all claims
- Mark confidence level for inferred information
- Research actual Amp capabilities from the manual
- Output ONLY the JSON object, no other text`
}
