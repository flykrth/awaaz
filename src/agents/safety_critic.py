"""Safety Critic agent for Project Awaaz 3+1 architecture with dynamic structured extraction."""

from typing import Any, Dict, List
from src.models.llm_gateway import get_llm_gateway
from src.state import CaseState, Contradiction, UncertaintyBudget


def safety_critic_node(state: CaseState) -> Dict[str, Any]:
    """Reviews state history, raw intake, and findings, dynamically extracts contradictions, and finalizes budget.

    Uses LLM Gateway with deterministic Sovereign fallback to audit cross-source contradictions
    into HARD and SOFT categories dynamically.
    """
    llm_gateway = get_llm_gateway()
    existing_contradictions: List[Contradiction] = list(state.contradictions)

    # Dynamic structured contradiction extraction across gathered evidence
    extracted_raw = llm_gateway.extract_contradictions(
        raw_intake=state.raw_intake,
        history=state.history,
    )

    for item in extracted_raw:
        dim = item.get("dimension", "physical_markers")
        c_type = item.get("type", "HARD")
        # Prevent exact duplicate contradictions
        if not any(c.dimension == dim and c.type == c_type and c.reason == item.get("reason") for c in existing_contradictions):
            existing_contradictions.append(
                Contradiction(
                    dimension=dim,
                    type=c_type,
                    source_a=item.get("source_a", "investigation_findings"),
                    source_b=item.get("source_b", "case_records"),
                    reason=item.get("reason", "Discrepancy detected across evidence sources."),
                )
            )

    # Finalize uncertainty budget based on findings and identified contradictions
    updated_budget = UncertaintyBudget({k: v.model_copy() for k, v in state.uncertainty_budget.items()})

    for contradiction in existing_contradictions:
        if contradiction.dimension in updated_budget and contradiction.type == "HARD":
            updated_budget[contradiction.dimension].status = "CONTRADICTED"
            updated_budget[contradiction.dimension].confidence = 0.0

    critic_entry = (
        f"Critic: Review completed. Contradictions identified: {len(existing_contradictions)}. "
        f"Finalized uncertainty budget across {len(updated_budget)} dimensions."
    )

    return {
        "history": list(state.history) + [critic_entry],
        "contradictions": existing_contradictions,
        "uncertainty_budget": updated_budget,
    }
