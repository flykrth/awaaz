"""Unit tests for Project Awaaz ChromaDB Vector RAG grounding."""

import pytest
from src.agents.investigators import context_investigator_node, evidence_investigator_node
from src.rag.vector_store import (
    SYNTHETIC_EVIDENCE_CORPUS,
    EvidenceVectorStore,
    get_vector_store,
    query_evidence,
)
from src.state import CaseState, EvidenceDimension, UncertaintyBudget


def test_vector_store_initialization_and_seeding():
    """Verify that EvidenceVectorStore initializes ChromaDB and seeds synthetic corpus."""
    store = get_vector_store()
    assert store is not None
    assert store.collection.count() >= len(SYNTHETIC_EVIDENCE_CORPUS)
    docs = store.get_all_documents()
    assert len(docs) == len(SYNTHETIC_EVIDENCE_CORPUS)


def test_query_evidence_timeline_dimension():
    """Verify querying timeline evidence returns relevant CCTV and transit manifests."""
    results = query_evidence(
        query="Patna Junction Railway platform departure",
        dimension="timeline",
        top_k=2,
    )
    assert len(results) <= 2
    assert len(results) > 0

    first = results[0]
    assert "chunk" in first
    assert "source_id" in first
    assert first["dimension"] == "timeline"
    assert "score" in first
    assert 0.0 <= first["score"] <= 1.0


def test_query_evidence_physical_markers():
    """Verify querying physical markers returns hospital admission or medical examination logs."""
    results = query_evidence(
        query="scar on left forearm PMCH hospital examination",
        dimension="physical_markers",
        top_k=2,
    )
    assert len(results) > 0
    assert any("hospital" in r["source_id"] or "witness" in r["source_id"] for r in results)
    assert all(r["dimension"] == "physical_markers" for r in results)


def test_query_evidence_without_dimension_filter():
    """Verify querying without dimension filter searches across all corpus categories."""
    results = query_evidence(query="Varanasi Dashashwamedh minor", top_k=3)
    assert len(results) > 0
    dimensions_found = {r["dimension"] for r in results}
    assert len(dimensions_found) >= 1


def test_evidence_investigator_adds_vector_citations():
    """Verify EvidenceInvestigator records both FastMCP and ChromaDB vector citations in budget."""
    budget = UncertaintyBudget({
        "identity": EvidenceDimension(required=True, status="MISSING", confidence=0.0, sources=[]),
        "physical_markers": EvidenceDimension(required=True, status="MISSING", confidence=0.0, sources=[]),
        "timeline": EvidenceDimension(required=True, status="CONFIRMED", confidence=0.95, sources=["fastmcp"]),
        "origin": EvidenceDimension(required=True, status="CONFIRMED", confidence=0.95, sources=["registry"]),
    })
    state = CaseState(
        case_id="CASE-001",
        raw_intake="Missing child from Patna Junction.",
        uncertainty_budget=budget,
    )

    result = evidence_investigator_node(state)
    updated_budget = result["uncertainty_budget"]

    # Verify identity dimension
    assert updated_budget["identity"].status == "CONFIRMED"
    assert "search_case_metadata" in updated_budget["identity"].sources
    assert any(s.startswith("vector_rag:") for s in updated_budget["identity"].sources)

    # Verify physical markers dimension
    assert updated_budget["physical_markers"].status == "CONFIRMED"
    assert "search_case_metadata" in updated_budget["physical_markers"].sources
    assert any(s.startswith("vector_rag:") for s in updated_budget["physical_markers"].sources)


def test_context_investigator_adds_vector_citations():
    """Verify ContextInvestigator records both FastMCP and ChromaDB vector citations in budget."""
    budget = UncertaintyBudget({
        "identity": EvidenceDimension(required=True, status="CONFIRMED", confidence=0.95, sources=["registry"]),
        "physical_markers": EvidenceDimension(required=True, status="CONFIRMED", confidence=0.95, sources=["registry"]),
        "timeline": EvidenceDimension(required=True, status="MISSING", confidence=0.0, sources=[]),
        "origin": EvidenceDimension(required=True, status="CONFIRMED", confidence=0.95, sources=["registry"]),
    })
    state = CaseState(
        case_id="CASE-001",
        raw_intake="Subject last seen at Patna Junction traveling to Ranchi on 2026-09-01.",
        uncertainty_budget=budget,
    )

    result = context_investigator_node(state)
    updated_budget = result["uncertainty_budget"]

    assert updated_budget["timeline"].status == "CONFIRMED"
    assert "FastMCP.check_case_timeline" in updated_budget["timeline"].sources
    assert any(s.startswith("vector_rag:") for s in updated_budget["timeline"].sources)


def test_hybrid_embedding_mode_switching():
    """Verify runtime switching of embedding modes (sovereign, transformer, hybrid)."""
    from src.rag.vector_store import (
        get_active_embedding_function,
        get_embedding_mode,
        set_embedding_mode,
    )

    orig_mode = get_embedding_mode()
    try:
        set_embedding_mode("sovereign")
        assert get_embedding_mode() == "sovereign"
        fn_sov = get_active_embedding_function()
        assert fn_sov.name() == "sovereign_embedding_function"

        set_embedding_mode("transformer")
        assert get_embedding_mode() == "transformer"
        fn_dense = get_active_embedding_function()
        assert fn_dense.name() == "dense_transformer_embedding_function"

        set_embedding_mode("hybrid")
        assert get_embedding_mode() == "hybrid"
    finally:
        set_embedding_mode(orig_mode)


def test_dense_transformer_fallback_generates_embeddings():
    """Verify DenseTransformerEmbeddingFunction generates embeddings via fallback safely."""
    from src.rag.vector_store import DenseTransformerEmbeddingFunction

    dense_fn = DenseTransformerEmbeddingFunction()
    docs = ["Subject seen at Patna Junction", "Medical file confirms forearm scar"]
    embeddings = dense_fn(docs)
    assert len(embeddings) == 2
    assert len(embeddings[0]) in (128, 384)


def test_track_04_connected_municipal_infrastructure_corpus():
    """Verify synthetic corpus contains connected municipal transit, CCTV, and pediatric health nodes."""
    store = get_vector_store()
    all_docs = store.get_all_documents()

    source_ids = {d["source_id"] for d in all_docs}
    assert "cctv_patna_railway" in source_ids
    assert "cctv_ranchi_bus_stand" in source_ids
    assert "cctv_godowlia_chowk" in source_ids
    assert "hospital_pmch_patna" in source_ids
    assert "rail_manifest_east_central" in source_ids
