import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { FileManifest } from './types.js'

export function slugify(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

function validateYAMLFrontmatter(content: string, filePath: string): void {
	if (!content.startsWith('---\n')) {
		throw new Error(`File ${filePath} is missing YAML frontmatter`)
	}
	const endIndex = content.indexOf('\n---\n', 4)
	if (endIndex === -1) {
		throw new Error(`File ${filePath} has malformed YAML frontmatter`)
	}
}

export async function writeFiles(manifest: FileManifest, outDir?: string): Promise<string> {
	if (manifest.files.length !== 9) {
		throw new Error(`Expected exactly 9 files, got ${manifest.files.length}`)
	}

	const outputDirectory = outDir || join('discovery', manifest.companySlug)
	await mkdir(outputDirectory, { recursive: true })

	for (const file of manifest.files) {
		validateYAMLFrontmatter(file.content, file.path)
	}

	await Promise.all(
		manifest.files.map(async (file) => {
			const filePath = join(outputDirectory, file.path)
			await writeFile(filePath, file.content, 'utf-8')
		})
	)

	return outputDirectory
}
