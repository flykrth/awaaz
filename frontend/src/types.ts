export interface EvidenceDimension {
  required: boolean
  status: 'CONFIRMED' | 'MISSING' | 'CONTRADICTED'
  confidence: number
  sources: string[]
  next_action?: string | null
}

export type UncertaintyBudget = Record<string, EvidenceDimension>

export interface Contradiction {
  dimension: string
  type: 'HARD' | 'SOFT'
  source_a: string
  source_b: string
  reason: string
}

export interface ExecutionStep {
  step: number
  node: string
  title: string
  icon: string
  plane: string
  tool: string
  reasoning: string
  budget?: UncertaintyBudget | null
  contradictions?: Contradiction[] | null
  terminal_state?: string | null
}

export interface CaseDossier {
  age?: number | string
  origin?: string
  timeline?: string
  physical_markers?: string
  quarantined: Record<string, string>
}

export interface CaseOption {
  id: string
  label: string
  raw_intake: string
  dossier: CaseDossier
  initial_budget: UncertaintyBudget
}

export interface DecisionExplanation {
  rule: string
  rule_id: string
  rule_triggered: string
  decision: 'HOLD' | 'REQUEST_INFORMATION' | 'INVESTIGATE' | 'HUMAN_REVIEW_REQUIRED'
  blocked: boolean
  blocked_status: boolean
  rationale: string
}

export interface InvestigateResponse {
  case_id: string
  terminal_state: string
  explanation: DecisionExplanation
  uncertainty_budget: UncertaintyBudget
  contradictions: Contradiction[]
  adversarial_injection_detected: boolean
  steps: ExecutionStep[]
  history: string[]
}

export interface RagResultItem {
  id: string
  chunk: string
  source_id: string
  dimension: string
  timestamp: string
  score: number
}

export interface RagSearchResponse {
  query: string
  dimension_filter: string | null
  count: number
  results: RagResultItem[]
}

export interface SecurityScanResponse {
  text: string
  is_jailbreak: boolean
  detected: boolean
  reason: string
}
