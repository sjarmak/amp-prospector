export interface ProspectorInput {
	company: string
	domains?: string[]
	contacts?: string[]
	productFocus?: string
	objectives?: string[]
	personas?: string[]
	timeframe?: string
	outDir?: string
}

export interface ResearchFact {
	claim: string
	citation: string
	confidence: 'high' | 'medium' | 'low'
	date?: string
}

export interface TimelineEvent {
	date: string
	event: string
	source: string
}

export interface Persona {
	name: string
	role: string
	responsibilities: string[]
}

export interface TechSignals {
	stack: string[]
	versions: Record<string, string>
	gaps: string[]
}

export interface Initiative {
	initiative: string
	trigger: string
	relevance: string
}

export interface Competition {
	incumbents: string[]
	partners: string[]
	maturity: string
}

export interface AmpCapability {
	capability: string
	examples: string[]
	citations: string[]
}

export interface Source {
	publisher: string
	title: string
	url: string
	date?: string
}

export interface ResearchBundle {
	facts: ResearchFact[]
	timelines: TimelineEvent[]
	personas: Persona[]
	techSignals: TechSignals
	initiatives: Initiative[]
	competition: Competition
	ampCapabilities: AmpCapability[]
	sources: Source[]
}

export interface GeneratedFile {
	path: string
	content: string
}

export interface FileManifest {
	companySlug: string
	files: GeneratedFile[]
}

export interface ProspectorResult {
	manifest: FileManifest
	outputDir: string
	filesWritten: number
}
