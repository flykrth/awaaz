"""Case Manager agent for Project Awaaz 3+1 architecture with real-time prompt injection defense."""

from typing import Any, Dict
from src.security.jailbreak_detector import is_jailbreak, scan_prompt_injection
from src.state import CaseState


def route_case_manager(state: CaseState) -> str:
    """Conditional routing function evaluating uncertainty budget and security alerts.

    Returns:
        Node name string: 'context_inv', 'evidence_inv', or 'critic'.
    """
    # Adversarial injection triggers immediate routing to Critic and Policy Engine (Rule 2 HOLD)
    if state.adversarial_injection_detected:
        return "critic"

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
    """Evaluates case state, performs real-time prompt injection audit, and decides routing.

    Workflow logic:
    - Real-time prompt injection scan on state.raw_intake -> sets adversarial_injection_detected
    - If adversarial injection detected -> route immediately to Safety Critic
    - If timeline is MISSING -> route to Context Investigator
    - If identity is MISSING -> route to Evidence Investigator
    - If all required budgets are CONFIRMED or CONTRADICTED -> route to Safety Critic
    """
    # Real-time prompt injection and jailbreak defense audit
    injection_scan = scan_prompt_injection(state.raw_intake)
    adversarial_flag = state.adversarial_injection_detected or injection_scan["detected"]

    updated_state_updates: Dict[str, Any] = {}
    if adversarial_flag and not state.adversarial_injection_detected:
        updated_state_updates["adversarial_injection_detected"] = True

    # Check routing with updated adversarial status
    if adversarial_flag:
        instruction = "Route to Safety Critic (Adversarial Injection Detected)"
        log_msg = (
            "Manager: Routing to Critic (Adversarial prompt injection detected in intake. "
            "Flagging security violation for Policy Engine Rule 2)"
        )
    else:
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

    result: Dict[str, Any] = {
        "history": list(state.history) + [log_msg],
        "instruction": instruction,
    }
    result.update(updated_state_updates)
    return result
