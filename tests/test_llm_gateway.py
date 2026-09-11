"""Unit tests for Project Awaaz Dual-Mode LLM Gateway and Sovereign Offline Fallback."""

import pytest
from src.models.llm_gateway import LLMGateway, LLMMode, get_llm_gateway, set_llm_mode


def test_sovereign_mode_default_and_fallback():
    """Verify Sovereign mode operates deterministically without network or API keys."""
    gateway = LLMGateway(mode="sovereign")
    assert gateway.get_mode() == "sovereign"

    response = gateway.generate("Explain missing child transit timeline")
    assert "Sovereign local reasoning completed" in response

    json_res = gateway.generate("Extract contradiction", json_mode=True)
    assert "sovereign_processed" in json_res


def test_mode_switching():
    """Verify LLMGateway allows runtime mode switching."""
    gateway = LLMGateway()
    gateway.set_mode("sovereign")
    assert gateway.get_mode() == "sovereign"

    gateway.set_mode("gemini")
    assert gateway.get_mode() == "gemini"

    gateway.set_mode("ollama")
    assert gateway.get_mode() == "ollama"

    # Reset back to sovereign for test safety
    set_llm_mode("sovereign")


def test_gemini_mode_graceful_fallback_without_api_key():
    """Verify Gemini mode gracefully falls back to Sovereign Mode when API key is missing."""
    gateway = LLMGateway(mode="gemini", gemini_api_key=None)
    # Even in gemini mode without key, generation must not crash
    result = gateway.generate("Test prompt")
    assert "Sovereign local reasoning completed" in result


def test_structured_contradiction_extraction_hard():
    """Verify contradiction extraction accurately audits HARD physical marker conflicts."""
    gateway = get_llm_gateway()
    intake = "Field report indicates scar on right forearm, but verified records show scar on left forearm."
    contradictions = gateway.extract_contradictions(raw_intake=intake, history=[])

    assert len(contradictions) > 0
    first = contradictions[0]
    assert first["dimension"] == "physical_markers"
    assert first["type"] == "HARD"
    assert "left forearm != right forearm" in first["reason"]


def test_structured_contradiction_extraction_soft():
    """Verify contradiction extraction categorizes minor spelling variance as SOFT."""
    gateway = get_llm_gateway()
    intake = "Case intake note with minor spelling variation between transcripts."
    contradictions = gateway.extract_contradictions(raw_intake=intake, history=[])

    assert len(contradictions) > 0
    assert any(c["type"] == "SOFT" for c in contradictions)


def test_dynamic_entity_extraction():
    """Verify dynamic extraction of origin, destination, and transit date from raw intake."""
    gateway = get_llm_gateway()
    case_record = {"origin": "Varanasi"}
    intake = "Subject seen at Varanasi proceeding towards Mumbai on 2026-09-05."

    entities = gateway.extract_entities_and_timeline(raw_intake=intake, case_record=case_record)
    assert entities["origin"] == "Varanasi"
    assert entities["dest"] == "Mumbai"
    assert entities["date"] == "2026-09-05"
    assert len(entities["requested_fields"]) > 0


def test_confidence_scoring_bounds():
    """Verify confidence score is bounded between 0.0 and 1.0."""
    gateway = get_llm_gateway()

    score_normal = gateway.score_confidence(base_confidence=0.95, rag_scores=[0.8, 0.9])
    assert 0.0 <= score_normal <= 1.0

    score_contradicted = gateway.score_confidence(contradiction_count=1)
    assert score_contradicted == 0.0
