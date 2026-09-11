"""Safety Critic agent for Project Awaaz 3+1 architecture."""

from typing import Any, Dict, List
from src.state import CaseState, Contradiction, UncertaintyBudget


def safety_critic_node(state: CaseState) -> Dict[str, Any]:
    """Reviews state history and findings, extracts contradictions, and finalizes uncertainty budget.

    Uses a static mock mapping for tests to simulate LLM JSON extraction of contradictions
    and safety critique across gathered evidence sources.
    """
    contradictions: List[Contradiction] = list(state.contradictions)

    # Static mock mapping simulating LLM JSON extraction from investigation findings
    combined_context = (state.raw_intake + " " + " ".join(state.history)).lower()

    if "hard contradiction" in combined_context or ("conflict" in combined_context and "timeline" in combined_context):
        if not any(c.dimension == "timeline" and c.type == "HARD" for c in contradictions):
            contradictions.append(
                Contradiction(
                    dimension="timeline",
                    type="HARD",
                    source_a="FastMCP.check_case_timeline",
                    source_b="field_witness_statement",
                    reason="Transit timeline fundamentally conflicts with witness timestamp.",
                )
            )

    if "identity conflict" in combined_context:
        if not any(c.dimension == "identity" for c in contradictions):
            contradictions.append(
                Contradiction(
                    dimension="identity",
                    type="HARD",
                    source_a="search_case_metadata",
                    source_b="raw_intake",
                    reason="Subject identity details conflict with intake record.",
                )
            )

    if "soft contradiction" in combined_context:
        if not any(c.type == "SOFT" for c in contradictions):
            contradictions.append(
                Contradiction(
                    dimension="physical_markers",
                    type="SOFT",
                    source_a="search_case_metadata",
                    source_b="field_witness_statement",
                    reason="Minor discrepancy in estimated height/clothing.",
                )
            )

    # Finalize uncertainty budget based on findings and identified contradictions
    updated_budget = UncertaintyBudget({k: v.model_copy() for k, v in state.uncertainty_budget.items()})

    for contradiction in contradictions:
        if contradiction.dimension in updated_budget and contradiction.type == "HARD":
            updated_budget[contradiction.dimension].status = "CONTRADICTED"
            updated_budget[contradiction.dimension].confidence = 0.0

    critic_entry = (
        f"Critic: Review completed. Contradictions identified: {len(contradictions)}. "
        f"Finalized uncertainty budget across {len(updated_budget)} dimensions."
    )

    return {
        "history": list(state.history) + [critic_entry],
        "contradictions": contradictions,
        "uncertainty_budget": updated_budget,
    }
