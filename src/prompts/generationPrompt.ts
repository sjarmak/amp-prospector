import type { ProspectorInput, ResearchBundle } from '../types.js'

export function generationPrompt(input: ProspectorInput, research: ResearchBundle): string {
	return `Generate 8 comprehensive markdown discovery files based on the research bundle.

Company: ${input.company}
${input.productFocus ? `Product Focus: ${input.productFocus}` : ''}
${input.objectives ? `Objectives: ${input.objectives.join(', ')}` : ''}

Research Bundle:
${JSON.stringify(research, null, 2)}

Create exactly 8 markdown files with the following structure:

1. **01_account_brief.md** - Company overview, business model, customer segments
2. **02_org_and_contacts.md** - Key personas, buying committee, contacts
3. **03_tech_stack.md** - Inferred technology stack, job signals, gaps
4. **04_initiatives_and_triggers.md** - Strategic initiatives and trigger events
5. **05_competition_and_landscape.md** - Competitors, incumbent tools, partners
6. **06_call_plan_and_talk_track.md** - Discovery questions and demo storyline
7. **07_discovery_framework.md** - Structured framework (Demographics → Culture → Wrap-up)
8. **08_custom_demo.md** - Tailored demo with prospect-specific Amp use cases

Requirements for each file:

- Include YAML frontmatter with: title, company, date, authors, personas, keywords, confidence, sources_count
- Add "So what for the demo?" sections in files 01, 03, and 05
- Include two pilot options at end of file 05
- Follow exact discovery framework sections in file 07
- Create custom demo (file 08) with:
  - Prospect-specific storyline
  - Amp capability mapping (Oracle, subagents, MCP/toolbox)
  - Steps, inputs, success metrics
  - Risk mitigations
- Include proper citations throughout
- Use factual information from the research bundle

Output a single JSON object:

\`\`\`json
{
  "companySlug": "company-name-slug",
  "files": [
    {
      "path": "01_account_brief.md",
      "content": "---\\ntitle: Account Brief\\n...\\n---\\n\\n# Content here"
    },
    {
      "path": "02_org_and_contacts.md",
      "content": "---\\ntitle: Organization & Contacts\\n...\\n---\\n\\n# Content here"
    }
  ]
}
\`\`\`

Important:
- Generate ALL 8 files
- Use proper YAML frontmatter
- Include citations from research bundle
- Make content specific to ${input.company}
- Output ONLY the JSON object, no other text`
}
