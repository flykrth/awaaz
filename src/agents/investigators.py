"""Investigator agent nodes for Project Awaaz 3+1 architecture."""

import json
from typing import Any, Dict
from src.state import CaseState, UncertaintyBudget
from src.tools.mcp_server import check_case_timeline, search_case_metadata
from src.tools.mock_db import MockCaseDB


def evidence_investigator_node(state: CaseState) -> Dict[str, Any]:
    """Simulates calling search_case_metadata via FastMCP.

    Retrieves permitted case metadata, updates evidence dimension statuses in the
    uncertainty budget, and appends the retrieval trace to state history.
    """
    requested_fields = ["age", "origin", "timeline", "physical_markers"]
    retrieved_raw = search_case_metadata(state.case_id, requested_fields)

    # Update uncertainty budget with retrieved evidence
    updated_budget = UncertaintyBudget({k: v.model_copy() for k, v in state.uncertainty_budget.items()})

    # Identity and physical markers corroborated by metadata search
    if "identity" in updated_budget and updated_budget["identity"].status == "MISSING":
        updated_budget["identity"].status = "CONFIRMED"
        updated_budget["identity"].confidence = 0.95
        if "search_case_metadata" not in updated_budget["identity"].sources:
            updated_budget["identity"].sources = list(updated_budget["identity"].sources) + ["search_case_metadata"]

    if "physical_markers" in updated_budget and updated_budget["physical_markers"].status == "MISSING":
        updated_budget["physical_markers"].status = "CONFIRMED"
        updated_budget["physical_markers"].confidence = 0.95
        if "search_case_metadata" not in updated_budget["physical_markers"].sources:
            updated_budget["physical_markers"].sources = list(updated_budget["physical_markers"].sources) + ["search_case_metadata"]

    history_entry = f"Evidence Investigator: Retrieved metadata via FastMCP: {retrieved_raw}"

    return {
        "history": list(state.history) + [history_entry],
        "uncertainty_budget": updated_budget,
    }


def context_investigator_node(state: CaseState) -> Dict[str, Any]:
    """Simulates calling check_case_timeline via FastMCP.

    Performs temporal route validation between case origin and destination,
    confirms timeline uncertainty budget, and updates state history.
    """
    case_record = MockCaseDB.CASES.get(state.case_id, {})
    origin = case_record.get("origin", "Patna")
    dest = "Ranchi"
    date = "2026-09-01"

    temporal_verification = check_case_timeline(origin=origin, dest=dest, date=date)

    # Update timeline dimension to CONFIRMED
    updated_budget = UncertaintyBudget({k: v.model_copy() for k, v in state.uncertainty_budget.items()})
    if "timeline" in updated_budget:
        updated_budget["timeline"].status = "CONFIRMED"
        updated_budget["timeline"].confidence = 0.95
        if "FastMCP.check_case_timeline" not in updated_budget["timeline"].sources:
            updated_budget["timeline"].sources = list(updated_budget["timeline"].sources) + ["FastMCP.check_case_timeline"]

    history_entry = (
        f"Context Investigator: Temporal verification via FastMCP check_case_timeline: {temporal_verification}"
    )

    return {
        "history": list(state.history) + [history_entry],
        "uncertainty_budget": updated_budget,
    }
