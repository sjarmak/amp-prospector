import type { ProspectorInput, ResearchBundle } from '../types.js'

export function batchGenerationPrompt(
	input: ProspectorInput,
	research: ResearchBundle,
	fileNames: string[]
): string {
	const fileDescriptions: Record<string, string> = {
		'01_account_brief.md': 'Company overview, business model, customer segments, and "So what for the demo?" section',
		'02_org_and_contacts.md': 'Key personas, buying committee, decision-makers, and contacts',
		'03_tech_stack.md': 'Technology infrastructure, job signals, gaps, and "So what for the demo?" section',
		'04_initiatives_and_triggers.md': 'Strategic initiatives, trigger events, and timing opportunities',
		'05_competition_and_landscape.md': 'Competitive positioning, market analysis, "So what for the demo?" section, and two pilot options',
		'06_call_plan_and_talk_track.md': 'Discovery questions and demo storyline',
		'07_discovery_framework.md': 'Structured conversation framework (Demographics → Culture → Wrap-up)',
		'08_custom_demo.md': 'Tailored Amp demo with prospect-specific use cases, capability mapping, steps, inputs, success metrics, and risk mitigations',
	}

	const fileList = fileNames.map(name => `- **${name}**: ${fileDescriptions[name]}`).join('\n')

	return `Generate ${fileNames.length} markdown discovery files based on the research bundle.

Company: ${input.company}
${input.productFocus ? `Product Focus: ${input.productFocus}` : ''}
${input.objectives ? `Objectives: ${input.objectives.join(', ')}` : ''}

Research Bundle:
${JSON.stringify(research, null, 2)}

Create these files:
${fileList}

Requirements for ALL files:
- Include YAML frontmatter with: title, company, date, authors, personas, keywords, confidence, sources_count
- Use factual information from the research bundle
- Include proper citations throughout
- Make content specific to ${input.company}

Output a single JSON object:

\`\`\`json
{
  "files": [
    {
      "path": "01_account_brief.md",
      "content": "---\\ntitle: Account Brief\\n...\\n---\\n\\n# Content here"
    }
  ]
}
\`\`\`

Important:
- Generate ALL ${fileNames.length} files specified above
- Use proper YAML frontmatter in each file
- Output ONLY the JSON object, no other text`
}
