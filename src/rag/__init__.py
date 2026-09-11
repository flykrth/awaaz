"""RAG package for Project Awaaz with ChromaDB vector store grounding."""

from src.rag.vector_store import (
    EvidenceVectorStore,
    SYNTHETIC_EVIDENCE_CORPUS,
    get_vector_store,
    query_evidence,
)

__all__ = [
    "EvidenceVectorStore",
    "SYNTHETIC_EVIDENCE_CORPUS",
    "get_vector_store",
    "query_evidence",
]
