import { execute } from '@sourcegraph/amp-sdk'
import type { AmpOptions } from '@sourcegraph/amp-sdk'
import { generationPrompt } from '../prompts/generationPrompt.js'
import { SYSTEM_PROSPECTOR } from '../prompts/systemProspector.js'
import type { ProspectorInput, ResearchBundle, FileManifest } from '../types.js'

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
				// Show progress indicator every few turns
				if (turnCount % 3 === 0) {
					console.log(`   ⏳ Generating files... (turn ${turnCount})`)
				}
			}
		}

		if (message.type === 'result') {
			if (message.is_error) {
				throw new Error(message.error)
			}
			const finalText = (message.result || '').trim() || lastAssistantText || ''
			return finalText
		}
	}

	throw new Error('No result received from generation phase')
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

const REQUIRED_FILES = [
	'01_account_brief.md',
	'02_org_and_contacts.md',
	'03_tech_stack.md',
	'04_initiatives_and_triggers.md',
	'05_competition_and_landscape.md',
	'06_call_plan_and_talk_track.md',
	'07_discovery_framework.md',
	'08_custom_demo.md',
]

function validateFileManifest(manifest: any): void {
	if (!manifest || typeof manifest !== 'object') {
		throw new Error('File manifest must be an object')
	}

	const m = manifest as Partial<FileManifest>

	if (!Array.isArray(m.files)) {
		throw new Error('File manifest missing "files" array')
	}

	if (typeof m.companySlug !== 'string' || !m.companySlug) {
		throw new Error('File manifest missing "companySlug" string')
	}

	const files = m.files

	if (files.length !== 8) {
		const missing = REQUIRED_FILES.filter((f) => !files.some((file) => file.path.endsWith(f)))
		throw new Error(
			`Expected exactly 8 files, got ${files.length}. Missing: ${missing.join(', ')}`
		)
	}

	const missingFiles = REQUIRED_FILES.filter(
		(required) => !files.some((file) => file.path.endsWith(required))
	)
	if (missingFiles.length > 0) {
		throw new Error(
			`Missing required files: ${missingFiles.join(', ')}. Got: ${files.map((f) => f.path).join(', ')}`
		)
	}

	for (const file of files) {
		if (!file.path || typeof file.path !== 'string') {
			throw new Error('Each file must have a "path" string property')
		}
		if (!file.content || typeof file.content !== 'string') {
			throw new Error(`File ${file.path} must have a "content" string property`)
		}
	}
}

export async function synthesize(
	input: ProspectorInput,
	research: ResearchBundle
): Promise<FileManifest> {
	console.log(`   📊 Research bundle size: ${JSON.stringify(research).length} chars`)
	const prompt = `${SYSTEM_PROSPECTOR}\n\n${generationPrompt(input, research)}`
	console.log(`   📝 Total prompt size: ${prompt.length} chars`)

	const options: AmpOptions = {
		dangerouslyAllowAll: true,
		visibility: 'private',
		logLevel: process.env.DEBUG ? 'debug' : 'info',
	}

	console.log('   ⏳ Waiting for AI to generate all 8 files (this may take 3-5 minutes)...')
	const result = await getResult(prompt, options)
	const jsonStr = extractJSON(result)

	try {
		const parsed = JSON.parse(jsonStr)
		validateFileManifest(parsed)
		return parsed as FileManifest
	} catch (error) {
		throw new Error(
			`Failed to parse file manifest: ${error instanceof Error ? error.message : String(error)}. Raw result: ${result.slice(0, 500)}`
		)
	}
}
