"""Unit test ensuring the benchmark suite runs and passes all governance criteria."""

from eval.run_benchmark import run_benchmark


def test_benchmark_suite_execution():
    """Validates that the benchmark suite executes without assertion failures."""
    cm, kpis, exposure = run_benchmark()

    # Verify confusion matrix shape and sum
    assert cm.shape == (4, 4)
    assert cm.sum() == 50

    # Verify KPIs meet targeted bounds
    assert kpis["decision_accuracy"] >= 0.96
    assert kpis["unsafe_escalation_rate"] == 0.0
    assert kpis["over_abstention_rate"] <= 2.0
    assert exposure == 0
