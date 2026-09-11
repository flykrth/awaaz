"""Project Awaaz - Streamlit Frontend Dashboard & Observability Trace.

Evidence-grounded case resolution agent with deterministic policy governance.
"""

from typing import Any, Dict, List, Optional
import streamlit as st

from src.graph import graph
from src.state import CaseState, EvidenceDimension, UncertaintyBudget
from src.tools.mock_db import MockCaseDB


# --- Page Configuration ---
st.set_page_config(
    page_title="Project Awaaz Dashboard",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --- Custom Styling ---
st.markdown(
    """
    <style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        margin-bottom: 0.2rem;
        color: #1E293B;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .signature-card-blocked {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(185, 28, 28, 0.05));
        border: 2px solid #EF4444;
        border-radius: 10px;
        padding: 1.5rem;
        margin-top: 1rem;
        margin-bottom: 1.5rem;
    }
    .signature-rule-badge {
        display: inline-block;
        background-color: #DC2626;
        color: #FFFFFF;
        font-weight: 800;
        font-size: 1.15rem;
        padding: 0.4rem 0.9rem;
        border-radius: 6px;
        letter-spacing: 0.05em;
        margin-top: 0.5rem;
        margin-bottom: 0.8rem;
    }
    .dimension-badge {
        padding: 0.25rem 0.6rem;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .badge-confirmed {
        background-color: #DCFCE7;
        color: #15803D;
    }
    .badge-missing {
        background-color: #FEF3C7;
        color: #B45309;
    }
    .badge-contradicted {
        background-color: #FEE2E2;
        color: #B91C1C;
    }
    .metric-box {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 0.8rem 1rem;
        margin-bottom: 0.5rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# --- Test Cases Definition Helper ---
TEST_CASE_OPTIONS = [
    "CASE-001 (Missing Timeline)",
    "CASE-002 (Hard Contradiction)",
    "CASE-003 (Clean Evidence)",
]


def create_initial_state(case_selection: str) -> CaseState:
    """Initializes a pristine CaseState according to the selected test case."""
    if case_selection == "CASE-001 (Missing Timeline)":
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

    elif case_selection == "CASE-002 (Hard Contradiction)":
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

    else:  # CASE-003 (Clean Evidence)
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


# --- Node Presentation Metadata ---
NODE_META = {
    "manager": {
        "title": "Case Manager Agent",
        "icon": "🧭",
        "tool": "None (Internal routing / policy logic)",
    },
    "context_inv": {
        "title": "Context Investigator",
        "icon": "⏱️",
        "tool": "FastMCP: check_case_timeline(origin, dest, date)",
    },
    "evidence_inv": {
        "title": "Evidence Investigator",
        "icon": "🔎",
        "tool": "FastMCP: search_case_metadata(case_id, requested_fields)",
    },
    "critic": {
        "title": "Safety Critic Agent",
        "icon": "⚖️",
        "tool": "Semantic Contradiction & Security Critic (Cross-Source Audit)",
    },
    "policy_eval": {
        "title": "Policy Evaluator Engine",
        "icon": "🛡️",
        "tool": "Deterministic Governance Engine (Rules 1-5)",
    },
}


# --- Sidebar Configuration ---
st.sidebar.title("Project Awaaz Dashboard")
st.sidebar.markdown(
    "**Evidence-Grounded Resolution Agent** featuring production type safety and zero-LLM deterministic policy governance."
)

selected_case = st.sidebar.selectbox(
    "Select a Test Case",
    options=TEST_CASE_OPTIONS,
    index=0,
    help="Choose one of the 3 canonical test scenarios to test investigation routing and policy evaluation.",
)

# Extract Case ID from selection
case_id = selected_case.split()[0]
db_record = MockCaseDB.CASES.get(case_id, {})

st.sidebar.markdown("---")
st.sidebar.subheader(f"📋 Database Dossier: {case_id}")

if db_record:
    st.sidebar.markdown(f"**Origin:** {db_record.get('origin', 'N/A')}")
    st.sidebar.markdown(f"**Age:** {db_record.get('age', 'N/A')}")
    st.sidebar.markdown(f"**Timeline:** {db_record.get('timeline', 'N/A')}")
    st.sidebar.markdown(f"**Physical Markers:** {db_record.get('physical_markers', 'N/A')}")

    with st.sidebar.expander("🔒 Data Minimization Policy", expanded=False):
        st.caption(
            "Sensitive fields (`exact_address`, `biometric_hash`, `contact_number`) are strictly quarantined "
            "and blocked from agent tool queries by policy."
        )
        st.markdown("**Quarantined Fields:**")
        st.code(
            "exact_address: [PROTECTED]\nbiometric_hash: [PROTECTED]\ncontact_number: [PROTECTED]",
            language="yaml",
        )

st.sidebar.markdown("---")
st.sidebar.caption("⚡ **System Architecture: 3+1 Agent Architecture**")
st.sidebar.caption("Case Manager ➔ Investigators (Context/Evidence) ➔ Safety Critic ➔ Policy Engine")


# --- Main Panel ---
st.markdown('<div class="main-header">Project Awaaz: Case Resolution & Governance</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-header">Live Multi-Agent Observability Trace & Deterministic Policy Enforcement</div>',
    unsafe_allow_html=True,
)

# Initialize pristine state for preview
initial_state = create_initial_state(selected_case)

# Dossier Card
col_dossier_1, col_dossier_2 = st.columns([3, 2])

with col_dossier_1:
    st.markdown(f"### 📂 Case Intake: `{initial_state.case_id}`")
    st.info(f"**Intake Summary:** {initial_state.raw_intake}")

with col_dossier_2:
    st.markdown("### 📊 Initial Uncertainty Budget")
    cols = st.columns(4)
    for idx, (dim_name, dim_val) in enumerate(initial_state.uncertainty_budget.items()):
        with cols[idx]:
            status_color = "badge-confirmed" if dim_val.status == "CONFIRMED" else "badge-missing"
            st.markdown(f"**{dim_name.title()}**")
            st.markdown(
                f'<span class="dimension-badge {status_color}">{dim_val.status}</span>',
                unsafe_allow_html=True,
            )
            st.caption(f"Conf: {dim_val.confidence:.2f}")

st.markdown("---")

# Session state handling for investigation runs
if "current_case" not in st.session_state or st.session_state.current_case != selected_case:
    st.session_state.current_case = selected_case
    st.session_state.has_run = False
    st.session_state.execution_steps = []
    st.session_state.final_state = None

run_btn = st.button("🚀 Run Investigation", type="primary", use_container_width=True)

if run_btn:
    st.session_state.has_run = True
    st.session_state.execution_steps = []
    st.session_state.final_state = None

    # Reset pristine state for fresh run
    current_state = create_initial_state(selected_case)
    accumulated_state: Dict[str, Any] = current_state.model_dump()
    steps_log: List[Dict[str, Any]] = []

    st.markdown("### 🔍 Live Execution Trace")

    with st.status("Investigating case evidence...", expanded=True) as status_box:
        step_counter = 1

        for event in graph.stream(current_state):
            for node_name, node_output in event.items():
                accumulated_state.update(node_output)

                meta = NODE_META.get(node_name, {
                    "title": node_name.title(),
                    "icon": "⚙️",
                    "tool": "N/A",
                })

                # Extract latest history message for this node
                history_list = node_output.get("history", [])
                latest_history = history_list[-1] if history_list else "Node executed successfully."

                step_record = {
                    "step": step_counter,
                    "node": node_name,
                    "title": meta["title"],
                    "icon": meta["icon"],
                    "tool": meta["tool"],
                    "reasoning": latest_history,
                    "budget": node_output.get("uncertainty_budget"),
                    "contradictions": node_output.get("contradictions"),
                    "terminal_state": node_output.get("terminal_state"),
                }
                steps_log.append(step_record)

                # Render live progress item inside status
                st.write(
                    f"**Step {step_counter}: {meta['icon']} {meta['title']}**  \n"
                    f"• *Tool Call:* `{meta['tool']}`  \n"
                    f"• *Reasoning:* {latest_history}"
                )

                if "uncertainty_budget" in node_output and node_output["uncertainty_budget"]:
                    ub = node_output["uncertainty_budget"]
                    st.caption(
                        "📊 Updated Dimensions: "
                        + ", ".join([f"{k} = {v.status} ({v.confidence:.2f})" for k, v in ub.items()])
                    )

                step_counter += 1

        status_box.update(label="✅ Investigation Completed", state="complete", expanded=True)

    st.session_state.execution_steps = steps_log
    st.session_state.final_state = accumulated_state


# --- Render Outcome & Observability Trace ---
if st.session_state.get("has_run") and st.session_state.get("final_state"):
    final_state = st.session_state.final_state
    terminal_state = final_state.get("terminal_state")

    st.markdown("---")
    st.markdown("### 🎯 Investigation Outcome")

    # =========================================================================
    # 4. The Signature UI (Contradiction Override)
    # =========================================================================
    if terminal_state == "HOLD":
        # Specific contradiction extraction
        contradictions = final_state.get("contradictions", [])
        if contradictions:
            first_c = contradictions[0]
            contradiction_msg = first_c.reason if hasattr(first_c, "reason") else first_c.get("reason", "")
            contradiction_dim = first_c.dimension if hasattr(first_c, "dimension") else first_c.get("dimension", "")
        else:
            contradiction_msg = "Physical marker contradiction detected: left forearm != right forearm"
            contradiction_dim = "physical_markers"

        # 1. St.error escalation blocked
        st.error("🚫 ESCALATION BLOCKED")

        # Visual mockup container for Signature UI
        st.markdown(
            f"""
            <div class="signature-card-blocked">
                <div style="font-size: 0.9rem; font-weight: 700; color: #991B1B; text-transform: uppercase; letter-spacing: 0.08em;">
                    Deterministic Policy Engine • Rule 1 Triggered
                </div>
                <div class="signature-rule-badge">
                    HARD CONTRADICTION &gt; SIMILARITY
                </div>
                <div style="font-size: 1.15rem; font-weight: 600; color: #7F1D1D; margin-top: 0.3rem;">
                    {contradiction_msg}
                </div>
                <div style="font-size: 0.95rem; color: #450A0A; margin-top: 0.8rem; line-height: 1.5;">
                    <strong>Governance Rationale:</strong> Automated escalation is strictly halted.
                    Even with high facial or contextual similarity, physical ground-truth contradictions
                    categorically override similarity scores to prevent false positive identifications.
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Contradiction breakdown details
        st.markdown("#### 🔍 Contradiction Incident Details")
        col_c1, col_c2, col_c3 = st.columns(3)
        with col_c1:
            st.metric("Contradiction Type", "HARD")
        with col_c2:
            st.metric("Dimension Affected", contradiction_dim.title())
        with col_c3:
            st.metric("Policy Decision", "HOLD")

        if contradictions:
            c_data = []
            for c in contradictions:
                c_dict = c if isinstance(c, dict) else c.model_dump()
                c_data.append({
                    "Dimension": c_dict.get("dimension"),
                    "Type": c_dict.get("type"),
                    "Source A": c_dict.get("source_a"),
                    "Source B": c_dict.get("source_b"),
                    "Reason": c_dict.get("reason"),
                })
            st.table(c_data)

    elif terminal_state == "HUMAN_REVIEW_REQUIRED":
        st.success("✅ ESCALATION AUTHORIZED")
        st.markdown(
            """
            > **Adjudicator Clearance:** All required dimensions have been corroborated with zero hard contradictions
            > or adversarial anomalies. Case has been authorized and queued for human adjudicator review.
            """
        )

        # Dimension scorecards
        st.markdown("#### 📋 Corroborated Evidence Dimensions")
        ub_data = final_state.get("uncertainty_budget", {})
        if hasattr(ub_data, "root"):
            ub_dict = ub_data.root
        elif hasattr(ub_data, "model_dump"):
            ub_dict = ub_data.model_dump()
        elif isinstance(ub_data, dict) and "root" in ub_data:
            ub_dict = ub_data["root"]
        else:
            ub_dict = ub_data

        cols = st.columns(4)
        for idx, (d_name, d_obj) in enumerate(ub_dict.items()):
            d_val = d_obj if isinstance(d_obj, dict) else d_obj.model_dump()
            with cols[idx]:
                st.markdown(f"**{d_name.title()}**")
                st.markdown('<span class="dimension-badge badge-confirmed">CONFIRMED</span>', unsafe_allow_html=True)
                st.metric("Confidence", f"{d_val.get('confidence', 0.0):.2f}")
                st.caption(f"Sources: {', '.join(d_val.get('sources', [])) or 'None'}")

        st.markdown("#### 📦 Final Compiled UncertaintyBudget JSON")
        # Display the final compiled UncertaintyBudget JSON
        st.json(ub_dict)

    else:
        st.info(f"Terminal State: {terminal_state}")

    # =========================================================================
    # Observability: Detailed Step-by-Step History Log
    # =========================================================================
    st.markdown("---")
    st.markdown("### 📜 Detailed Agent Execution History")

    steps = st.session_state.get("execution_steps", [])
    for step in steps:
        with st.expander(
            f"Step {step['step']}: {step['icon']} {step['title']} (Tool: {step['tool'].split(':')[0]})",
            expanded=False,
        ):
            st.markdown(f"**Executing Node:** `{step['node']}`")
            st.markdown(f"**Tool Invocations:** `{step['tool']}`")
            st.markdown("**Agent Reasoning & State Log:**")
            st.info(step["reasoning"])

            if step.get("budget"):
                b = step["budget"]
                b_dump = b.model_dump() if hasattr(b, "model_dump") else b
                st.markdown("**Uncertainty Budget at this step:**")
                st.json(b_dump)

            if step.get("contradictions"):
                st.markdown("**Contradictions flagged at this step:**")
                st.write(step["contradictions"])

            if step.get("terminal_state"):
                st.markdown(f"**Terminal State Assigned:** `{step['terminal_state']}`")
