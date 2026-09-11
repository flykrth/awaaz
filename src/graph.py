"""LangGraph workflow definition for Project Awaaz 3+1 agent architecture."""

from typing import Any, Dict
from langgraph.graph import END, StateGraph

from src.agents.case_manager import case_manager_node, route_case_manager
from src.agents.investigators import (
    context_investigator_node,
    evidence_investigator_node,
)
from src.agents.safety_critic import safety_critic_node
from src.policy_engine import evaluate_policy
from src.state import CaseState


def policy_eval_node(state: CaseState) -> Dict[str, Any]:
    """Evaluates case state against governance policies and assigns terminal state.

    Possible terminal states:
    - 'HOLD'
    - 'INVESTIGATE'
    - 'REQUEST_INFORMATION'
    - 'HUMAN_REVIEW_REQUIRED'
    """
    decision = evaluate_policy(state)
    history_entry = f"Policy Eval: Policy evaluated with terminal state '{decision}'"
    return {
        "terminal_state": decision,
        "history": list(state.history) + [history_entry],
    }


def build_graph() -> StateGraph:
    """Constructs the Project Awaaz 3+1 StateGraph workflow."""
    builder = StateGraph(CaseState)

    # Add agent nodes
    builder.add_node("manager", case_manager_node)
    builder.add_node("evidence_inv", evidence_investigator_node)
    builder.add_node("context_inv", context_investigator_node)
    builder.add_node("critic", safety_critic_node)
    builder.add_node("policy_eval", policy_eval_node)

    # Set entry point to manager
    builder.set_entry_point("manager")

    # Conditional edges from manager based on uncertainty budget
    builder.add_conditional_edges(
        "manager",
        route_case_manager,
        {
            "context_inv": "context_inv",
            "evidence_inv": "evidence_inv",
            "critic": "critic",
        },
    )

    # Investigators report back to manager
    builder.add_edge("evidence_inv", "manager")
    builder.add_edge("context_inv", "manager")

    # Critic passes findings to policy engine
    builder.add_edge("critic", "policy_eval")

    # Policy evaluation leads to workflow completion
    builder.add_edge("policy_eval", END)

    return builder


# Compile executable graph
graph = build_graph().compile()
