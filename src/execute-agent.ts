#!/usr/bin/env node
import 'dotenv/config'
import { runProspector } from './orchestrator.js'

async function main() {
	const company = process.argv[2]

	if (!company) {
		console.error(`
Prospector - AI-powered sales discovery agent for Amp

Usage:
  npx tsx ./src/execute-agent.ts "Company name or website"

Examples:
  npx tsx ./src/execute-agent.ts "Shopify"
  npx tsx ./src/execute-agent.ts "stripe.com"

Environment:
  AMP_API_KEY is required (set in .env or environment)
  Get your key from: https://ampcode.com/settings/keys

Output:
  Creates 8 markdown discovery files in ./discovery/<company-slug>/
`)
		process.exit(1)
	}

	if (!process.env.AMP_API_KEY) {
		console.error('Error: AMP_API_KEY environment variable is required')
		console.error('Get your API key from: https://ampcode.com/settings/keys')
		console.error('Set it in your .env file or export it in your shell')
		process.exit(1)
	}

	console.log(`\n🚀 Starting Prospector for: ${company}`)

	try {
		const result = await runProspector({ company })
		console.log(`\n✅ Done! Discovery files available at: ${result.outputDir}`)
	} catch (error) {
		console.error('\n❌ Error:', error instanceof Error ? error.message : String(error))
		process.exit(1)
	}
}

main()
