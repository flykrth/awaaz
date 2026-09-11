"""Unit tests for Project Awaaz LangGraph 3+1 agent architecture."""

import pytest
from src.agents.case_manager import case_manager_node, route_case_manager
from src.agents.investigators import (
    context_investigator_node,
    evidence_investigator_node,
)
from src.agents.safety_critic import safety_critic_node
from src.graph import build_graph, graph, policy_eval_node
from src.state import CaseState, Contradiction, EvidenceDimension, UncertaintyBudget

VALID_TERMINAL_STATES = {
    "HOLD",
    "INVESTIGATE",
    "REQUEST_INFORMATION",
    "HUMAN_REVIEW_REQUIRED",
}


def _create_base_budget(missing_dim: str = "timeline") -> UncertaintyBudget:
    """Helper to create an uncertainty budget where one specific dimension is MISSING and others are CONFIRMED."""
    dimensions = ["identity", "timeline", "physical_markers", "origin"]
    budget_dict = {}
    for dim in dimensions:
        if dim == missing_dim:
            budget_dict[dim] = EvidenceDimension(
                required=True,
                status="MISSING",
                confidence=0.0,
                sources=[],
            )
        else:
            budget_dict[dim] = EvidenceDimension(
                required=True,
                status="CONFIRMED",
                confidence=0.95,
                sources=["initial_records"],
            )
    return UncertaintyBudget(budget_dict)


def test_missing_timeline_routes_manager_context_inv_manager_critic_policy_eval():
    """Validates the exact trace: Manager -> Context Investigator -> Manager -> Critic -> Policy Eval.

    Ensures that an initial state with a missing timeline:
    1. Invokes the Manager and routes to Context Investigator.
    2. Context Investigator calls FastMCP check_case_timeline and confirms the timeline.
    3. Graph loops back to Manager, which detects all required budgets are confirmed and routes to Critic.
    4. Critic reviews state history and populates contradictions/final budget.
    5. Policy Eval assesses policy rules and assigns a valid terminal state.
    """
    initial_budget = _create_base_budget(missing_dim="timeline")
    initial_state = CaseState(
        case_id="CASE-001",
        raw_intake="Subject last seen at Patna Junction, travel route unverified.",
        uncertainty_budget=initial_budget,
    )

    # 1. Verify streaming trace of executed node IDs
    stream_nodes = []
    for event in graph.stream(initial_state):
        stream_nodes.extend(event.keys())

    assert stream_nodes == [
        "manager",
        "context_inv",
        "manager",
        "critic",
        "policy_eval",
    ], f"Unexpected stream routing trace: {stream_nodes}"

    # 2. Invoke full graph and inspect state
    result = graph.invoke(initial_state)

    # 3. Assert trace recorded in state history
    history = result["history"]
    trace = [entry.split(":")[0].strip() for entry in history]

    expected_trace = [
        "Manager",
        "Context Investigator",
        "Manager",
        "Critic",
        "Policy Eval",
    ]
    assert trace == expected_trace, f"History trace mismatch: {trace} != {expected_trace}"

    # 4. Assert valid terminal state produced
    terminal_state = result["terminal_state"]
    assert terminal_state in VALID_TERMINAL_STATES
    assert terminal_state == "HUMAN_REVIEW_REQUIRED"

    # 5. Assert timeline dimension is now CONFIRMED with evidence sources
    final_budget = result["uncertainty_budget"]
    assert final_budget["timeline"].status == "CONFIRMED"
    assert final_budget["timeline"].confidence >= 0.9
    assert "FastMCP.check_case_timeline" in final_budget["timeline"].sources


def test_missing_identity_routes_through_evidence_investigator():
    """Initial state with missing identity routes: Manager -> Evidence Investigator -> Manager -> Critic -> Policy Eval."""
    initial_budget = _create_base_budget(missing_dim="identity")
    initial_state = CaseState(
        case_id="CASE-001",
        raw_intake="Identity unverified in field report.",
        uncertainty_budget=initial_budget,
    )

    stream_nodes = []
    for event in graph.stream(initial_state):
        stream_nodes.extend(event.keys())

    assert stream_nodes == [
        "manager",
        "evidence_inv",
        "manager",
        "critic",
        "policy_eval",
    ]

    result = graph.invoke(initial_state)
    trace = [entry.split(":")[0].strip() for entry in result["history"]]
    assert trace == [
        "Manager",
        "Evidence Investigator",
        "Manager",
        "Critic",
        "Policy Eval",
    ]

    assert result["terminal_state"] == "HUMAN_REVIEW_REQUIRED"
    assert result["uncertainty_budget"]["identity"].status == "CONFIRMED"
    assert "search_case_metadata" in result["uncertainty_budget"]["identity"].sources


def test_all_confirmed_routes_directly_to_critic():
    """If all required dimensions are already CONFIRMED, Manager routes straight to Critic."""
    budget_dict = {
        dim: EvidenceDimension(
            required=True,
            status="CONFIRMED",
            confidence=0.99,
            sources=["verified_archive"],
        )
        for dim in ["identity", "timeline", "physical_markers", "origin"]
    }
    initial_state = CaseState(
        case_id="CASE-002",
        raw_intake="Complete and verified case file.",
        uncertainty_budget=UncertaintyBudget(budget_dict),
    )

    stream_nodes = []
    for event in graph.stream(initial_state):
        stream_nodes.extend(event.keys())

    assert stream_nodes == ["manager", "critic", "policy_eval"]

    result = graph.invoke(initial_state)
    assert result["terminal_state"] == "HUMAN_REVIEW_REQUIRED"


def test_critic_identifies_hard_contradiction_triggering_hold():
    """If a hard contradiction is extracted during investigation, policy eval sets terminal state to HOLD."""
    initial_budget = _create_base_budget(missing_dim="timeline")
    initial_state = CaseState(
        case_id="CASE-003",
        raw_intake="Case exhibits hard contradiction between witness statements and railway records.",
        uncertainty_budget=initial_budget,
    )

    result = graph.invoke(initial_state)

    assert result["terminal_state"] == "HOLD"
    assert any(c.type == "HARD" for c in result["contradictions"])
    assert result["uncertainty_budget"]["timeline"].status == "CONTRADICTED"


def test_individual_node_contracts():
    """Validates contract of each node function independently."""
    budget = _create_base_budget(missing_dim="timeline")
    state = CaseState(
        case_id="CASE-001",
        raw_intake="Testing node contracts.",
        uncertainty_budget=budget,
    )

    # 1. Case Manager
    mgr_res = case_manager_node(state)
    assert "history" in mgr_res
    assert route_case_manager(state) == "context_inv"

    # 2. Context Investigator
    ctx_res = context_investigator_node(state)
    assert ctx_res["uncertainty_budget"]["timeline"].status == "CONFIRMED"

    # 3. Evidence Investigator
    state.uncertainty_budget["identity"].status = "MISSING"
    assert route_case_manager(state) == "context_inv"  # timeline checked first
    state.uncertainty_budget["timeline"].status = "CONFIRMED"
    assert route_case_manager(state) == "evidence_inv"
    evi_res = evidence_investigator_node(state)
    assert evi_res["uncertainty_budget"]["identity"].status == "CONFIRMED"

    # 4. Safety Critic
    state.uncertainty_budget["identity"].status = "CONFIRMED"
    critic_res = safety_critic_node(state)
    assert "contradictions" in critic_res

    # 5. Policy Eval
    eval_res = policy_eval_node(state)
    assert eval_res["terminal_state"] in VALID_TERMINAL_STATES
