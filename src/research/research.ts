import { execute } from '@sourcegraph/amp-sdk'
import type { AmpOptions } from '@sourcegraph/amp-sdk'
import { researchPrompt } from '../prompts/researchPrompt.js'
import { SYSTEM_PROSPECTOR } from '../prompts/systemProspector.js'
import type { ProspectorInput, ResearchBundle } from '../types.js'

async function getResult(prompt: string, options: AmpOptions): Promise<string> {
	let lastAssistantText = ''
	let turnCount = 0

	for await (const message of execute({ prompt, options })) {
		if (message.type === 'assistant') {
			turnCount++
			const textBlocks = message.message.content
				.filter((c: any) => c.type === 'text')
				.map((c: any) => c.text)
				.join('')
				.trim()

			if (textBlocks) {
				lastAssistantText = textBlocks
				const findings = extractFindings(textBlocks)
				if (findings) {
					console.log(`   ${findings}`)
				}
			}

			const toolUses = message.message.content.filter((c: any) => c.type === 'tool_use')
			for (const tool of toolUses) {
				if (tool.type === 'tool_use' && tool.name === 'web_search') {
					const query = typeof tool.input === 'object' && tool.input !== null
						? (tool.input as Record<string, unknown>).objective || (tool.input as Record<string, unknown>).query || ''
						: ''
					console.log(`   🔍 Searching: ${query}`)
				} else if (tool.type === 'tool_use' && tool.name === 'read_web_page') {
					const url = typeof tool.input === 'object' && tool.input !== null
						? String((tool.input as Record<string, unknown>).url || '')
						: ''
					const domain = url.match(/https?:\/\/([^/]+)/)?.[1] || url
					console.log(`   📖 Reading: ${domain}`)
				}
			}
		}

		if (message.type === 'result') {
			if (message.is_error) {
				throw new Error(message.error)
			}
			const resultContent = (message.result || '').trim()
			const finalText = resultContent || lastAssistantText || ''
			return finalText
		}
	}

	throw new Error('No result received from research phase')
}

function extractFindings(text: string): string | null {
	const companyMatch = text.match(/(?:found|discovered|identified).*?:\s*(.{0,80})/i)
	if (companyMatch?.[1]) {
		return `✓ ${companyMatch[1].trim()}`
	}

	if (text.includes('Pass A') || text.includes('company basics')) {
		return '→ Researching company basics...'
	}
	if (text.includes('Pass B') || text.includes('12-month')) {
		return '→ Researching recent initiatives...'
	}
	if (text.includes('Pass C') || text.includes('Amp')) {
		return '→ Researching Amp capabilities...'
	}

	return null
}

function extractJSON(text: string): string {
	const jsonCodeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/)
	if (jsonCodeBlockMatch?.[1]) {
		return jsonCodeBlockMatch[1].trim()
	}

	const jsonObjectMatch = text.match(/\{[\s\S]*\}/)
	if (jsonObjectMatch?.[0]) {
		return jsonObjectMatch[0]
	}

	return text.trim()
}

export async function runResearch(input: ProspectorInput): Promise<ResearchBundle> {
	const prompt = `${SYSTEM_PROSPECTOR}\n\n${researchPrompt(input)}`

	const options: AmpOptions = {
		dangerouslyAllowAll: true,
		visibility: 'private',
		logLevel: process.env.DEBUG ? 'debug' : 'info',
	}

	const result = await getResult(prompt, options)
	const jsonStr = extractJSON(result)

	try {
		const parsed = JSON.parse(jsonStr)
		validateResearchBundle(parsed)
		return parsed as ResearchBundle
	} catch (error) {
		throw new Error(
			`Failed to parse research bundle: ${error instanceof Error ? error.message : String(error)}`
		)
	}
}

function validateResearchBundle(bundle: any): void {
	if (!bundle || typeof bundle !== 'object') {
		throw new Error('Research bundle must be an object')
	}

	const b = bundle as Partial<ResearchBundle>

	if (!Array.isArray(b.facts)) {
		throw new Error('Research bundle missing "facts" array')
	}
	if (!Array.isArray(b.timelines)) {
		throw new Error('Research bundle missing "timelines" array')
	}
	if (!Array.isArray(b.personas)) {
		throw new Error('Research bundle missing "personas" array')
	}
	if (!b.techSignals || typeof b.techSignals !== 'object') {
		throw new Error('Research bundle missing "techSignals" object')
	}
	if (!Array.isArray(b.initiatives)) {
		throw new Error('Research bundle missing "initiatives" array')
	}
	if (!b.competition || typeof b.competition !== 'object') {
		throw new Error('Research bundle missing "competition" object')
	}
	if (!Array.isArray(b.ampCapabilities)) {
		throw new Error('Research bundle missing "ampCapabilities" array')
	}
	if (!Array.isArray(b.sources)) {
		throw new Error('Research bundle missing "sources" array')
	}
}
