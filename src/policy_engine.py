"""Deterministic, zero-LLM policy engine for Project Awaaz case routing.

Enforces Multi-Tier Civic Escalation Protocols:
- HOLD: Hard contradiction or adversarial threat -> Halt and alert supervisors.
- REQUEST_INFORMATION: Missing critical intake fields -> Ping reporting citizen/station.
- INVESTIGATE: Incomplete corroboration -> Dispatch FastMCP transit/hospital agents.
- HUMAN_REVIEW_REQUIRED: All dimensions corroborated -> Route to Municipal Child Welfare Officer with full audit trail.
"""

from typing import Any, Dict
from src.state import CaseState, calculate_entropy


def explain_decision(state: CaseState) -> Dict[str, Any]:
    """Evaluates case state against governance policies and returns an explanatory dictionary.

    Returns:
        dict containing:
            - rule: string identifier of the rule triggered (e.g. 'Rule 1')
            - rule_id: string identifier ('RULE_1', etc.)
            - rule_triggered: string identifier of the rule triggered
            - decision: resulting policy decision ('HOLD', 'REQUEST_INFORMATION', 'INVESTIGATE', 'HUMAN_REVIEW_REQUIRED')
            - blocked: boolean indicating whether case progression is halted
            - blocked_status: boolean mirroring blocked
            - rationale: detailed human-readable explanation of why this rule was triggered
            - escalation_tier: multi-tier civic escalation classification
            - civic_action: municipal operational action to dispatch
            - entropy: current uncertainty entropy metric (1.0 unresolved to 0.0 resolved)
    """
    entropy = calculate_entropy(state.uncertainty_budget)

    # Rule 1: If any contradiction has type == "HARD", return "HOLD"
    hard_contradictions = [c for c in state.contradictions if c.type == "HARD"]
    if hard_contradictions:
        dims = ", ".join(sorted({c.dimension for c in hard_contradictions}))
        reasons = "; ".join(c.reason for c in hard_contradictions)
        return {
            "rule": "Rule 1",
            "rule_id": "RULE_1",
            "rule_triggered": "Rule 1",
            "decision": "HOLD",
            "blocked": True,
            "blocked_status": True,
            "escalation_tier": "SUPERVISORY_HOLD",
            "civic_action": "Hard contradiction detected. Halt automated escalation and alert child protection supervisors.",
            "entropy": entropy,
            "rationale": (
                f"Hard contradiction detected across dimension(s) [{dims}]. "
                f"Details: {reasons}."
            ),
        }

    # Rule 2: If adversarial_injection_detected is True, return "HOLD"
    if state.adversarial_injection_detected:
        return {
            "rule": "Rule 2",
            "rule_id": "RULE_2",
            "rule_triggered": "Rule 2",
            "decision": "HOLD",
            "blocked": True,
            "blocked_status": True,
            "escalation_tier": "SUPERVISORY_HOLD",
            "civic_action": "Adversarial threat detected. Halt execution immediately and alert administrative supervisors.",
            "entropy": entropy,
            "rationale": (
                "Adversarial prompt injection attempt detected in intake data. "
                "Execution halted immediately for safety."
            ),
        }

    # Rule 3: If required_user_input_missing is True, return "REQUEST_INFORMATION"
    if state.required_user_input_missing:
        return {
            "rule": "Rule 3",
            "rule_id": "RULE_3",
            "rule_triggered": "Rule 3",
            "decision": "REQUEST_INFORMATION",
            "blocked": False,
            "blocked_status": False,
            "escalation_tier": "CITIZEN_STATION_PING",
            "civic_action": "Missing critical intake fields. Ping reporting citizen or intake police station for missing metadata.",
            "entropy": entropy,
            "rationale": (
                "Mandatory user input is missing. Requesting additional information from the user."
            ),
        }

    # Rule 4: If any required dimension in uncertainty_budget has status != "CONFIRMED", return "INVESTIGATE"
    unconfirmed_dimensions = [
        (name, dim)
        for name, dim in state.uncertainty_budget.items()
        if dim.required and dim.status != "CONFIRMED"
    ]
    if unconfirmed_dimensions:
        details = ", ".join(
            f"{name} (status={dim.status}, confidence={dim.confidence:.2f})"
            for name, dim in unconfirmed_dimensions
        )
        return {
            "rule": "Rule 4",
            "rule_id": "RULE_4",
            "rule_triggered": "Rule 4",
            "decision": "INVESTIGATE",
            "blocked": False,
            "blocked_status": False,
            "escalation_tier": "FASTMCP_MUNICIPAL_DISPATCH",
            "civic_action": "Incomplete corroboration. Dispatch FastMCP transit surveillance and hospital investigator agents.",
            "entropy": entropy,
            "rationale": (
                f"Required evidence dimension(s) remain unconfirmed: {details}."
            ),
        }

    # Rule 5: Otherwise, return "HUMAN_REVIEW_REQUIRED"
    return {
        "rule": "Rule 5",
        "rule_id": "RULE_5",
        "rule_triggered": "Rule 5",
        "decision": "HUMAN_REVIEW_REQUIRED",
        "blocked": False,
        "blocked_status": False,
        "escalation_tier": "MUNICIPAL_CW_OFFICER_ROUTE",
        "civic_action": "All dimensions corroborated. Route to Municipal Child Welfare Officer with full audit trail.",
        "entropy": entropy,
        "rationale": (
            "All required dimensions are fully confirmed with zero hard contradictions "
            "or adversarial risks. Ready for human adjudicator review."
        ),
    }


def evaluate_policy(state: CaseState) -> str:
    """Evaluates case state against governance policies and returns the decision string.

    Policy Evaluation Order:
      1. Hard contradiction -> 'HOLD'
      2. Adversarial injection -> 'HOLD'
      3. Required user input missing -> 'REQUEST_INFORMATION'
      4. Required dimension not confirmed -> 'INVESTIGATE'
      5. Otherwise -> 'HUMAN_REVIEW_REQUIRED'
    """
    return explain_decision(state)["decision"]
