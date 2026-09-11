"""Unit tests for Project Awaaz Streamlit application logic and state workflows."""

import pytest
from app import NODE_META, TEST_CASE_OPTIONS, create_initial_state
from src.graph import graph
from src.state import CaseState


def test_test_case_options():
    """Validates the required test case options exist in the application."""
    expected_options = [
        "CASE-001 (Missing Timeline)",
        "CASE-002 (Hard Contradiction)",
        "CASE-003 (Clean Evidence)",
    ]
    assert TEST_CASE_OPTIONS == expected_options


def test_case_001_initial_state_and_execution():
    """CASE-001 (Missing Timeline) initializes with missing timeline and finishes with HUMAN_REVIEW_REQUIRED."""
    state = create_initial_state("CASE-001 (Missing Timeline)")
    assert isinstance(state, CaseState)
    assert state.case_id == "CASE-001"
    assert state.uncertainty_budget["timeline"].status == "MISSING"
    assert state.uncertainty_budget["identity"].status == "CONFIRMED"

    # Simulate execution via graph stream
    final_state = dict(state.model_dump())
    nodes_executed = []
    for event in graph.stream(state):
        for node_name, node_output in event.items():
            nodes_executed.append(node_name)
            final_state.update(node_output)

    assert "context_inv" in nodes_executed
    assert final_state["terminal_state"] == "HUMAN_REVIEW_REQUIRED"
    assert final_state["uncertainty_budget"]["timeline"].status == "CONFIRMED"


def test_case_002_hard_contradiction_blocks_escalation():
    """CASE-002 (Hard Contradiction) detects physical marker contradiction and sets terminal state to HOLD."""
    state = create_initial_state("CASE-002 (Hard Contradiction)")
    assert isinstance(state, CaseState)
    assert state.case_id == "CASE-002"
    assert state.uncertainty_budget["identity"].status == "MISSING"

    final_state = dict(state.model_dump())
    nodes_executed = []
    for event in graph.stream(state):
        for node_name, node_output in event.items():
            nodes_executed.append(node_name)
            final_state.update(node_output)

    assert "evidence_inv" in nodes_executed
    assert "critic" in nodes_executed
    assert "policy_eval" in nodes_executed
    assert final_state["terminal_state"] == "HOLD"

    # Contradiction verification
    contradictions = final_state["contradictions"]
    assert len(contradictions) > 0
    assert any(c.dimension == "physical_markers" and c.type == "HARD" for c in contradictions)
    assert any("left forearm != right forearm" in c.reason for c in contradictions)


def test_case_003_clean_evidence_authorizes_escalation():
    """CASE-003 (Clean Evidence) processes clean records and finishes with HUMAN_REVIEW_REQUIRED."""
    state = create_initial_state("CASE-003 (Clean Evidence)")
    assert isinstance(state, CaseState)
    assert state.case_id == "CASE-003"
    assert all(dim.status == "CONFIRMED" for dim in state.uncertainty_budget.values())

    final_state = dict(state.model_dump())
    nodes_executed = []
    for event in graph.stream(state):
        for node_name, node_output in event.items():
            nodes_executed.append(node_name)
            final_state.update(node_output)

    assert "critic" in nodes_executed
    assert "policy_eval" in nodes_executed
    assert final_state["terminal_state"] == "HUMAN_REVIEW_REQUIRED"
    assert len(final_state["contradictions"]) == 0


def test_node_metadata_complete():
    """Verifies all graph nodes have complete metadata mapping."""
    required_nodes = ["manager", "context_inv", "evidence_inv", "critic", "policy_eval"]
    for node in required_nodes:
        assert node in NODE_META
        assert "title" in NODE_META[node]
        assert "icon" in NODE_META[node]
        assert "tool" in NODE_META[node]


def test_streamlit_apptest_ui_workflow():
    """Runs end-to-end Streamlit AppTest to verify rendering of traces and outcomes."""
    from pathlib import Path
    from streamlit.testing.v1 import AppTest

    app_path = Path(__file__).parent.parent / "app.py"

    # CASE-002 Hard Contradiction test
    at = AppTest.from_file(str(app_path), default_timeout=15)
    at.run()
    assert not at.exception
    at.sidebar.selectbox[0].select("CASE-002 (Hard Contradiction)").run()
    assert not at.exception
    at.button[0].click().run()
    assert not at.exception
    assert len(at.error) > 0
    assert "ESCALATION BLOCKED" in at.error[0].value

    # CASE-003 Clean Evidence test
    at3 = AppTest.from_file(str(app_path), default_timeout=15)
    at3.run()
    assert not at3.exception
    at3.sidebar.selectbox[0].select("CASE-003 (Clean Evidence)").run()
    assert not at3.exception
    at3.button[0].click().run()
    assert not at3.exception
    assert len(at3.success) > 0
    assert "ESCALATION AUTHORIZED" in at3.success[0].value
    assert len(at3.json) > 0


def test_streamlit_apptest_mode_switcher():
    """Verifies that the sidebar mode switcher toggles without error."""
    from pathlib import Path
    from streamlit.testing.v1 import AppTest

    app_path = Path(__file__).parent.parent / "app.py"
    at = AppTest.from_file(str(app_path), default_timeout=15)
    at.run()
    assert not at.exception
    assert len(at.sidebar.radio) > 0
    # Toggle to Live LLM Mode
    at.sidebar.radio[0].set_value("Live LLM Mode (Gemini 2.5)").run()
    assert not at.exception
    # Toggle back to Sovereign Mode
    at.sidebar.radio[0].set_value("Sovereign Offline Mode (Day 4 Bonus)").run()
    assert not at.exception


def test_streamlit_apptest_tab_civic_and_entropy():
    """Verifies that Tab 4 telemetry and uncertainty entropy metrics render in the dashboard."""
    from pathlib import Path
    from streamlit.testing.v1 import AppTest

    app_path = Path(__file__).parent.parent / "app.py"
    at = AppTest.from_file(str(app_path), default_timeout=15)
    at.run()
    assert not at.exception

    # Execute Case 1 to generate entropy curve
    at.sidebar.selectbox[0].select("CASE-001 (Missing Timeline)").run()
    assert not at.exception
    at.button[0].click().run()
    assert len(at.metric) > 0
    assert any("Initial Uncertainty" in m.label for m in at.metric)
    assert any("Final Uncertainty" in m.label for m in at.metric)
