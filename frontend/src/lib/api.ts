import { CaseDossier, InvestigationResult, LangGraphStep } from "./types";
import { MOCK_CASES, MOCK_RESULTS } from "./mockData";

export async function getCases(): Promise<CaseDossier[]> {
  return Object.values(MOCK_CASES);
}

export async function getCase(caseId: string): Promise<CaseDossier | null> {
  return MOCK_CASES[caseId] || null;
}

export async function runInvestigation(
  caseId: string,
  onStep?: (step: LangGraphStep) => void
): Promise<InvestigationResult> {
  const result = MOCK_RESULTS[caseId] || MOCK_RESULTS["CASE-001"];

  // If streaming callback provided, simulate realistic stepped execution
  if (onStep) {
    for (let i = 0; i < result.steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 380));
      onStep(result.steps[i]);
    }
  }

  return result;
}

export interface ProbeResult {
  status: "BLOCKED" | "ALLOWED";
  field: string;
  exception?: string;
  response?: any;
  governanceMessage: string;
}

export async function probeFastMCPField(field: string, caseId = "CASE-002"): Promise<ProbeResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const sensitiveFields = ["exact_address", "biometric_hash", "contact_number"];

  if (sensitiveFields.includes(field)) {
    return {
      status: "BLOCKED",
      field,
      exception: "ValueError: UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy.",
      governanceMessage:
        "FastMCP Pre-LLM Quarantine Gate rejected query before payload could reach agent token context.",
    };
  }

  const caseData = MOCK_CASES[caseId];
  return {
    status: "ALLOWED",
    field,
    response: (caseData as any)[field] ?? "Field not recorded",
    governanceMessage: "Field verified safe under municipal data minimization schema.",
  };
}

export interface DispatchResponse {
  status: "DISPATCHED";
  case_id: string;
  priority: string;
  transit_hub: string;
  coordination_action: string;
  pii_quarantine_enforced: boolean;
  disclosed_attributes: Record<string, any>;
  quarantined_attributes: string[];
  message: string;
}

export async function dispatchCivicResources(
  caseId: string,
  priority: "HIGH" | "CRITICAL" | "STANDARD",
  transitHub: string
): Promise<DispatchResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const caseData = MOCK_CASES[caseId] || MOCK_CASES["CASE-001"];

  return {
    status: "DISPATCHED",
    case_id: caseId,
    priority,
    transit_hub: transitHub,
    coordination_action: "Transit Surveillance Priority Flag & Child Protection Unit Alert",
    pii_quarantine_enforced: true,
    disclosed_attributes: {
      age: caseData.age,
      physical_markers: caseData.physical_markers,
    },
    quarantined_attributes: ["exact_address", "biometric_hash", "contact_number"],
    message: `Civic alert level '${priority}' registered at '${transitHub}' for case '${caseId}'. Zero minor PII disclosed under municipal data minimization policy.`,
  };
}
