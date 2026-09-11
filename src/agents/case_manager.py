"""Case Manager agent for Project Awaaz 3+1 architecture."""

from typing import Any, Dict
from src.state import CaseState


def route_case_manager(state: CaseState) -> str:
    """Conditional routing function evaluating uncertainty budget.

    Returns:
        Node name string: 'context_inv', 'evidence_inv', or 'critic'.
    """
    if state.uncertainty_budget["timeline"].status == "MISSING":
        return "context_inv"
    elif state.uncertainty_budget["identity"].status == "MISSING":
        return "evidence_inv"
    elif all(
        dim.status in ("CONFIRMED", "CONTRADICTED")
        for dim in state.uncertainty_budget.values()
        if dim.required
    ):
        return "critic"
    return "critic"


def case_manager_node(state: CaseState) -> Dict[str, Any]:
    """Evaluates case state and decides routing instructions.

    Mocked LLM reasoning logic:
    - If timeline is MISSING -> route to Context Investigator
    - If identity is MISSING -> route to Evidence Investigator
    - If all required budgets are CONFIRMED or CONTRADICTED -> route to Safety Critic
    """
    next_route = route_case_manager(state)

    if next_route == "context_inv":
        instruction = "Route to Context Investigator"
        log_msg = "Manager: Routing to Context Investigator (timeline is MISSING)"
    elif next_route == "evidence_inv":
        instruction = "Route to Evidence Investigator"
        log_msg = "Manager: Routing to Evidence Investigator (identity is MISSING)"
    else:
        instruction = "Route to Safety Critic"
        log_msg = "Manager: Routing to Critic (all required budgets confirmed or contradicted)"

    return {
        "history": list(state.history) + [log_msg],
        "instruction": instruction,
    }
