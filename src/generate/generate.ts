import { execute } from '@sourcegraph/amp-sdk'
import type { AmpOptions } from '@sourcegraph/amp-sdk'
import { batchGenerationPrompt } from '../prompts/batchGenerationPrompt.js'
import { SYSTEM_PROSPECTOR } from '../prompts/systemProspector.js'
import type { ProspectorInput, ResearchBundle, FileManifest, GeneratedFile } from '../types.js'
import { slugify } from '../writeFiles.js'

async function getResult(prompt: string, options: AmpOptions): Promise<string> {
	let lastAssistantText = ''
	let turnCount = 0

	const startTime = Date.now()
	let lastLogTime = startTime
	let messageCount = 0
	
	for await (const message of execute({ prompt, options })) {
		messageCount++
		const elapsed = Math.round((Date.now() - startTime) / 1000)
		
		console.log(`   📨 Message #${messageCount} (${elapsed}s): ${message.type}`)
		
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

// Generate in smaller batches for reliability
const FILE_BATCHES = [
	['01_account_brief.md', '02_org_and_contacts.md'],
	['03_tech_stack.md', '04_initiatives_and_triggers.md'],
	['05_competition_and_landscape.md', '06_call_plan_and_talk_track.md'],
	['07_discovery_framework.md', '08_custom_demo.md'],
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
	console.log('   📝 Generating files in batches for reliability...')

	const options: AmpOptions = {
		dangerouslyAllowAll: true,
		visibility: 'private',
		logLevel: process.env.DEBUG ? 'debug' : 'info',
	}

	const allFiles: GeneratedFile[] = []

	// Generate files in batches
	for (let i = 0; i < FILE_BATCHES.length; i++) {
		const batch = FILE_BATCHES[i]
		console.log(`\n   📦 Batch ${i + 1}/${FILE_BATCHES.length}: ${batch.join(', ')}`)
		
		const prompt = `${SYSTEM_PROSPECTOR}\n\n${batchGenerationPrompt(input, research, batch)}`
		
		const timeoutPromise = new Promise<string>((_, reject) => {
			setTimeout(() => reject(new Error(`Batch ${i + 1} timed out after 5 minutes`)), 5 * 60 * 1000)
		})
		
		const result = await Promise.race([
			getResult(prompt, options),
			timeoutPromise
		])
		
		const jsonStr = extractJSON(result)
		
		try {
			const parsed = JSON.parse(jsonStr)
			if (!parsed.files || !Array.isArray(parsed.files)) {
				throw new Error('Response missing "files" array')
			}
			
			// Validate we got the expected files for this batch
			for (const expectedFile of batch) {
				if (!parsed.files.some((f: GeneratedFile) => f.path === expectedFile)) {
					throw new Error(`Missing expected file: ${expectedFile}`)
				}
			}
			
			allFiles.push(...parsed.files)
			console.log(`   ✓ Generated ${parsed.files.length} files`)
		} catch (error) {
			throw new Error(
				`Failed to parse batch ${i + 1}: ${error instanceof Error ? error.message : String(error)}`
			)
		}
	}

	const manifest: FileManifest = {
		companySlug: slugify(input.company),
		files: allFiles,
	}

	validateFileManifest(manifest)
	return manifest
}
