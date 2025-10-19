import { writeFiles } from './writeFiles.js'
import { runResearch } from './research/research.js'
import { synthesize } from './generate/generate.js'
import type { ProspectorInput, ProspectorResult } from './types.js'

function normalizeInput(input: ProspectorInput): ProspectorInput {
	return {
		...input,
		company: input.company.trim(),
		domains: input.domains?.map((d) => d.trim()),
		contacts: input.contacts?.map((c) => c.trim()),
		timeframe: input.timeframe || 'last 12 months',
	}
}

export async function runProspector(input: ProspectorInput): Promise<ProspectorResult> {
	const normalizedInput = normalizeInput(input)

	console.log('\n🔍 Phase 1: Research')
	console.log(`   Researching ${normalizedInput.company}...`)
	const researchBundle = await runResearch(normalizedInput)
	console.log('   ✓ Research complete')

	console.log('\n📝 Phase 2: Synthesis')
	console.log('   Generating discovery files...')
	const manifest = await synthesize(normalizedInput, researchBundle)
	console.log('   ✓ Synthesis complete')

	console.log('\n💾 Phase 3: Writing Files')
	const outputDir = await writeFiles(manifest, normalizedInput.outDir)
	console.log(`   ✓ Files written to ${outputDir}`)

	console.log('\n📊 Summary:')
	console.log(`   Company: ${normalizedInput.company}`)
	console.log(`   Files: ${manifest.files.length}`)
	console.log(`   Location: ${outputDir}`)

	return {
		manifest,
		outputDir,
		filesWritten: manifest.files.length,
	}
}
