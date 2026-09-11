"""FastAPI REST API server for Project Awaaz Multi-Agent Governance Command Center."""

import os
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.graph import graph
from src.models.llm_gateway import get_llm_gateway, set_llm_mode
from src.policy_engine import explain_decision
from src.rag.vector_store import get_vector_store, query_evidence
from src.security.jailbreak_detector import is_jailbreak, scan_prompt_injection
from src.state import CaseState, EvidenceDimension, UncertaintyBudget
from src.tools.mock_db import MockCaseDB

# Create FastAPI app
app = FastAPI(
    title="Project Awaaz API",
    description="Multi-Agent Governance & Evidence-Grounded Case Resolution System",
    version="2.0.0",
)

# Enable CORS for Vite frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Node presentation metadata for UI graph & logs
NODE_META = {
    "manager": {
        "title": "Case Manager Agent",
        "icon": "🧭",
        "plane": "Plane 1: Routing & Orchestration",
        "tool": "None (Uncertainty Budget Routing)",
    },
    "context_inv": {
        "title": "Context Investigator",
        "icon": "⏱️",
        "plane": "Plane 2: FastMCP Investigators",
        "tool": "FastMCP: check_case_timeline(origin, dest, date)",
    },
    "evidence_inv": {
        "title": "Evidence Investigator",
        "icon": "🔎",
        "plane": "Plane 2: FastMCP Investigators",
        "tool": "FastMCP: search_case_metadata(case_id, requested_fields)",
    },
    "critic": {
        "title": "Safety Critic Agent",
        "icon": "⚖️",
        "plane": "Plane 3: Adversarial Contradiction Audit",
        "tool": "Cross-Source Audit & Discrepancy Categorization",
    },
    "policy_eval": {
        "title": "Policy Evaluator Engine",
        "icon": "🛡️",
        "plane": "The +1 Plane: Deterministic Governance",
        "tool": "Deterministic Governance Rules 1-5 (Zero-LLM)",
    },
}

TEST_CASE_OPTIONS = [
    "CASE-001 (Missing Timeline)",
    "CASE-002 (Hard Contradiction)",
    "CASE-003 (Clean Evidence)",
]


def create_initial_state(case_selection: str) -> CaseState:
    """Initializes a pristine CaseState according to the selected test case."""
    if case_selection.startswith("CASE-001"):
        budget = UncertaintyBudget({
            "identity": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.95,
                sources=["initial_records"],
            ),
            "timeline": EvidenceDimension(
                required=True,
                status="MISSING",
                confidence=0.0,
                sources=[],
            ),
            "physical_markers": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.95,
                sources=["initial_records"],
            ),
            "origin": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.95,
                sources=["initial_records"],
            ),
        })
        return CaseState(
            case_id="CASE-001",
            raw_intake="Subject last seen at Patna Junction on 2026-09-01. Route and transit history unverified.",
            uncertainty_budget=budget,
            contradictions=[],
            adversarial_injection_detected=False,
            required_user_input_missing=False,
        )

    elif case_selection.startswith("CASE-002"):
        budget = UncertaintyBudget({
            "identity": EvidenceDimension(
                required=True,
                status="MISSING",
                confidence=0.0,
                sources=[],
            ),
            "timeline": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.95,
                sources=["initial_records"],
            ),
            "physical_markers": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.95,
                sources=["initial_records"],
            ),
            "origin": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.95,
                sources=["initial_records"],
            ),
        })
        return CaseState(
            case_id="CASE-002",
            raw_intake=(
                "Facial recognition match score 98.4% at Ranchi Bus Stand. Field report indicates subject "
                "has a prominent scar on right forearm, whereas verified case records confirm scar on left forearm. "
                "Physical marker contradiction detected: left forearm != right forearm."
            ),
            uncertainty_budget=budget,
            contradictions=[],
            adversarial_injection_detected=False,
            required_user_input_missing=False,
        )

    else:  # CASE-003
        budget = UncertaintyBudget({
            "identity": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.98,
                sources=["birth_registry_extract", "aadhaar_match"],
            ),
            "timeline": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.98,
                sources=["cctv_godowlia_chowk", "rail_manifest"],
            ),
            "physical_markers": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.98,
                sources=["red_wristband_verified", "medical_record"],
            ),
            "origin": EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.98,
                sources=["varanasi_police_records"],
            ),
        })
        return CaseState(
            case_id="CASE-003",
            raw_intake="Complete verified documentary case intake with corroborating records and zero anomalies.",
            uncertainty_budget=budget,
            contradictions=[],
            adversarial_injection_detected=False,
            required_user_input_missing=False,
        )


# Request/Response models
class InvestigateRequest(BaseModel):
    case_selection: str


class CustomInvestigateRequest(BaseModel):
    intake_text: str
    identity_status: str = "CONFIRMED"
    timeline_status: str = "MISSING"
    physical_status: str = "CONFIRMED"
    origin_status: str = "CONFIRMED"


class RagSearchRequest(BaseModel):
    query: str
    dimension: Optional[str] = None
    top_k: int = Field(default=3, ge=1, le=10)


class SecurityScanRequest(BaseModel):
    text: str


class ModeChangeRequest(BaseModel):
    mode: str


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Project Awaaz Multi-Agent Command Center",
        "track": "Track 04: Sustainability, Smart Infrastructure & Future Communities",
    }


@app.get("/api/cases")
def list_cases():
    cases_data = []
    for option in TEST_CASE_OPTIONS:
        case_id = option.split()[0]
        db_rec = MockCaseDB.CASES.get(case_id, {})
        initial_st = create_initial_state(option)

        cases_data.append({
            "id": case_id,
            "label": option,
            "raw_intake": initial_st.raw_intake,
            "dossier": {
                "age": db_rec.get("age"),
                "origin": db_rec.get("origin"),
                "timeline": db_rec.get("timeline"),
                "physical_markers": db_rec.get("physical_markers"),
                "quarantined": {
                    "exact_address": "[PROTECTED BY DATA MINIMIZATION]",
                    "biometric_hash": "[PROTECTED BY DATA MINIMIZATION]",
                    "contact_number": "[PROTECTED BY DATA MINIMIZATION]",
                },
            },
            "initial_budget": {
                k: v.model_dump() for k, v in initial_st.uncertainty_budget.items()
            },
        })
    return {"cases": cases_data}


@app.post("/api/investigate")
def run_investigation(req: InvestigateRequest):
    case_state = create_initial_state(req.case_selection)
    accumulated: Dict[str, Any] = case_state.model_dump()
    steps_log: List[Dict[str, Any]] = []

    step_counter = 1
    for event in graph.stream(case_state):
        for node_name, node_output in event.items():
            accumulated.update(node_output)
            meta = NODE_META.get(node_name, {
                "title": node_name.title(),
                "icon": "⚙️",
                "plane": "Agent Workflow",
                "tool": "Internal",
            })
            history_list = node_output.get("history", [])
            latest_history = history_list[-1] if history_list else "Node completed successfully."

            budget_dump = None
            if "uncertainty_budget" in node_output and node_output["uncertainty_budget"]:
                b = node_output["uncertainty_budget"]
                budget_dump = b.model_dump() if hasattr(b, "model_dump") else b

            contradictions_dump = None
            if "contradictions" in node_output and node_output["contradictions"]:
                c_list = node_output["contradictions"]
                contradictions_dump = [
                    c.model_dump() if hasattr(c, "model_dump") else c for c in c_list
                ]

            step_record = {
                "step": step_counter,
                "node": node_name,
                "title": meta["title"],
                "icon": meta["icon"],
                "plane": meta["plane"],
                "tool": meta["tool"],
                "reasoning": latest_history,
                "budget": budget_dump,
                "contradictions": contradictions_dump,
                "terminal_state": node_output.get("terminal_state"),
            }
            steps_log.append(step_record)
            step_counter += 1

    # Final evaluation explanation
    eval_state = CaseState.model_validate(accumulated)
    explanation = explain_decision(eval_state)

    final_budget = {
        k: v.model_dump() if hasattr(v, "model_dump") else v
        for k, v in eval_state.uncertainty_budget.items()
    }

    final_contradictions = [
        c.model_dump() if hasattr(c, "model_dump") else c for c in eval_state.contradictions
    ]

    return {
        "case_id": eval_state.case_id,
        "terminal_state": eval_state.terminal_state,
        "explanation": explanation,
        "uncertainty_budget": final_budget,
        "contradictions": final_contradictions,
        "adversarial_injection_detected": eval_state.adversarial_injection_detected,
        "steps": steps_log,
        "history": eval_state.history,
    }


@app.post("/api/custom-investigate")
def run_custom_investigation(req: CustomInvestigateRequest):
    # Scan for jailbreaks first
    scan_res = scan_prompt_injection(req.intake_text)

    budget = UncertaintyBudget({
        "identity": EvidenceDimension(
            required=True,
            status=req.identity_status,
            confidence=0.95 if req.identity_status == "CONFIRMED" else 0.0,
            sources=["intake"] if req.identity_status == "CONFIRMED" else [],
        ),
        "timeline": EvidenceDimension(
            required=True,
            status=req.timeline_status,
            confidence=0.95 if req.timeline_status == "CONFIRMED" else 0.0,
            sources=["transit_records"] if req.timeline_status == "CONFIRMED" else [],
        ),
        "physical_markers": EvidenceDimension(
            required=True,
            status=req.physical_status,
            confidence=0.95 if req.physical_status == "CONFIRMED" else 0.0,
            sources=["medical_record"] if req.physical_status == "CONFIRMED" else [],
        ),
        "origin": EvidenceDimension(
            required=True,
            status=req.origin_status,
            confidence=0.95 if req.origin_status == "CONFIRMED" else 0.0,
            sources=["registry"] if req.origin_status == "CONFIRMED" else [],
        ),
    })

    case_state = CaseState(
        case_id="CUSTOM-CASE",
        raw_intake=req.intake_text,
        uncertainty_budget=budget,
        contradictions=[],
        adversarial_injection_detected=scan_res["detected"],
        required_user_input_missing=False,
    )

    accumulated: Dict[str, Any] = case_state.model_dump()
    steps_log: List[Dict[str, Any]] = []
    step_counter = 1

    for event in graph.stream(case_state):
        for node_name, node_output in event.items():
            accumulated.update(node_output)
            meta = NODE_META.get(node_name, {
                "title": node_name.title(),
                "icon": "⚙️",
                "plane": "Workflow",
                "tool": "Internal",
            })
            history_list = node_output.get("history", [])
            latest_msg = history_list[-1] if history_list else "Node completed."

            budget_dump = None
            if "uncertainty_budget" in node_output and node_output["uncertainty_budget"]:
                b = node_output["uncertainty_budget"]
                budget_dump = b.model_dump() if hasattr(b, "model_dump") else b

            steps_log.append({
                "step": step_counter,
                "node": node_name,
                "title": meta["title"],
                "icon": meta["icon"],
                "plane": meta["plane"],
                "tool": meta["tool"],
                "reasoning": latest_msg,
                "budget": budget_dump,
                "terminal_state": node_output.get("terminal_state"),
            })
            step_counter += 1

    eval_state = CaseState.model_validate(accumulated)
    explanation = explain_decision(eval_state)

    return {
        "case_id": eval_state.case_id,
        "terminal_state": eval_state.terminal_state,
        "explanation": explanation,
        "adversarial_scan": scan_res,
        "adversarial_injection_detected": eval_state.adversarial_injection_detected,
        "uncertainty_budget": {
            k: v.model_dump() for k, v in eval_state.uncertainty_budget.items()
        },
        "contradictions": [
            c.model_dump() if hasattr(c, "model_dump") else c for c in eval_state.contradictions
        ],
        "steps": steps_log,
    }


@app.post("/api/rag/search")
def search_rag(req: RagSearchRequest):
    dim_filter = None if req.dimension in ("All Dimensions", "", None) else req.dimension
    results = query_evidence(query=req.query, dimension=dim_filter, top_k=req.top_k)
    return {
        "query": req.query,
        "dimension_filter": dim_filter,
        "count": len(results),
        "results": results,
    }


@app.get("/api/rag/documents")
def list_rag_documents():
    store = get_vector_store()
    docs = store.get_all_documents()
    return {"total": len(docs), "documents": docs}


@app.post("/api/security/scan")
def scan_security(req: SecurityScanRequest):
    scan_result = scan_prompt_injection(req.text)
    jb_flag = is_jailbreak(req.text)
    return {
        "text": req.text,
        "is_jailbreak": jb_flag,
        "detected": scan_result["detected"],
        "reason": scan_result["reason"],
    }


@app.get("/api/mode")
def get_current_mode():
    gateway = get_llm_gateway()
    has_key = bool(os.environ.get("GEMINI_API_KEY"))
    return {
        "mode": gateway.mode,
        "has_gemini_key": has_key,
        "active_description": (
            "Sovereign Offline Mode (100% deterministic, 0 external API calls, offline reliable)"
            if gateway.mode == "sovereign"
            else "Live Gemini 2.5 Mode (Real-time LLM reasoning with sovereign fallback)"
        ),
    }


@app.post("/api/mode")
def set_mode(req: ModeChangeRequest):
    if req.mode not in ("sovereign", "gemini"):
        raise HTTPException(status_code=400, detail="Mode must be 'sovereign' or 'gemini'")
    set_llm_mode(req.mode)
    return get_current_mode()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
