# Project Awaaz

**Project Awaaz** is an evidence-grounded case resolution agent featuring production-grade type safety and zero external LLM dependencies for core policy decisions.

## Architecture

- **State Schema (`src/state.py`)**:
  - `Contradiction`: Tracks discrepancies between sources (`HARD` vs `SOFT`).
  - `EvidenceDimension`: Tracks dimension statuses (`CONFIRMED`, `MISSING`, `CONTRADICTED`), confidence scores ($0.0 - 1.0$), sources, and next actions.
  - `UncertaintyBudget`: Structured dictionary mapping core dimensions (`identity`, `timeline`, `physical_markers`, `origin`) to `EvidenceDimension` states.
  - `CaseState`: LangGraph-compatible state container tracking intake, budget, contradictions, adversarial injection flags, user input requirements, and execution history.

- **Deterministic Policy Engine (`src/policy_engine.py`)**:
  - **Rule 1**: Any `HARD` contradiction $\rightarrow$ `HOLD` (Execution halted).
  - **Rule 2**: Adversarial prompt injection detected $\rightarrow$ `HOLD` (Security containment).
  - **Rule 3**: Required user input missing $\rightarrow$ `REQUEST_INFORMATION`.
  - **Rule 4**: Any required dimension in `uncertainty_budget` unconfirmed $\rightarrow$ `INVESTIGATE`.
  - **Rule 5**: All clear $\rightarrow$ `HUMAN_REVIEW_REQUIRED`.
  - `explain_decision(state)`: Detailed decision audit logging returning triggered rule, decision, blocked status, and human-readable rationale.

## Getting Started

### Installation

```bash
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

### Running Tests

```bash
pytest -v
```

### Running the Evaluation Benchmark

```bash
python eval/run_benchmark.py
```
