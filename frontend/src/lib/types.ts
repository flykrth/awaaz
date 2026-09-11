export type DimensionStatus = "CONFIRMED" | "MISSING" | "CONTRADICTED" | "UNVERIFIED";

export interface EvidenceDimension {
  required: boolean;
  status: DimensionStatus;
  confidence: number;
  sources: string[];
}

export type UncertaintyBudget = Record<string, EvidenceDimension>;

export interface Contradiction {
  dimension: string;
  type: "HARD" | "SOFT";
  source_a: string;
  source_b: string;
  reason: string;
}

export type TerminalState = "HOLD" | "HUMAN_REVIEW_REQUIRED" | "REQUEST_INFORMATION" | "INVESTIGATE";

export interface CaseDossier {
  case_id: string;
  title: string;
  subtitle: string;
  age: number;
  origin: string;
  timeline: string;
  physical_markers: string;
  registered_hub: string;
  exact_address?: string; // Quarantined in UI
  biometric_hash?: string; // Quarantined in UI
  contact_number?: string; // Quarantined in UI
  raw_intake: string;
  similarity_score?: number;
  initial_entropy: number;
  target_entropy: number;
}

export interface LangGraphStep {
  step: number;
  node: "manager" | "evidence_inv" | "context_inv" | "critic" | "policy_eval";
  title: string;
  plane: string;
  icon: string;
  tool: string;
  toolType: "FastMCP" | "ChromaDB RAG" | "Dual-Mode LLM" | "Deterministic Policy" | "Security Audit";
  reasoning: string;
  timestamp: string;
  uncertainty_budget?: UncertaintyBudget;
  entropy?: number;
  contradictions?: Contradiction[];
  terminal_state?: TerminalState;
}

export interface InvestigationResult {
  case_id: string;
  terminal_state: TerminalState;
  final_entropy: number;
  entropy_history: number[];
  steps: LangGraphStep[];
  contradictions: Contradiction[];
  uncertainty_budget: UncertaintyBudget;
  similarity_score?: number;
  policy_rule_triggered?: string;
  quarantine_log: {
    blocked_fields: string[];
    safe_fields: string[];
    zero_pii_verified: boolean;
  };
}

export interface RAGSourceEvidence {
  id: string;
  source_name: string;
  facility: string;
  location: string;
  checkpoint_coverage: string;
  handoff_latency: string;
  confidence: number;
  snippet: string;
  metadata_tags: string[];
}
