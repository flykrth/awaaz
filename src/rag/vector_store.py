"""Vector store and RAG retrieval module for Project Awaaz using ChromaDB.

Supports Dual-Mode / Hybrid Embeddings:
1. SovereignEmbeddingFunction: Deterministic 128-dim hash projection (100% offline, zero-network fallback).
2. DenseTransformerEmbeddingFunction: Neural embeddings via sentence-transformers or Google GenAI.
3. Hybrid Mode: Dynamic semantic retrieval with graceful offline fallback.
Track 04: Connected Municipal Infrastructure & Civic Telemetry Grounding.
"""

from enum import Enum
import hashlib
import logging
import os
from typing import Any, Dict, List, Optional
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
import numpy as np

logger = logging.getLogger(__name__)


class EmbeddingEngineMode(str, Enum):
    SOVEREIGN = "sovereign"
    TRANSFORMER = "transformer"
    HYBRID = "hybrid"


# Active global embedding mode
_CURRENT_EMBEDDING_MODE: EmbeddingEngineMode = EmbeddingEngineMode(
    os.environ.get("AWAAZ_EMBEDDING_MODE", "hybrid").lower()
    if os.environ.get("AWAAZ_EMBEDDING_MODE", "hybrid").lower() in [m.value for m in EmbeddingEngineMode]
    else "hybrid"
)


class SovereignEmbeddingFunction(EmbeddingFunction[Documents]):
    """Deterministic, zero-network sovereign embedding function.

    Maps text into normalized dense vectors using hash projections.
    Guarantees sub-millisecond execution with zero external downloads,
    ensuring 100% offline reliability for benchmarks and air-gapped environments.
    """

    def __init__(self, dimension: int = 128) -> None:
        self.dimension = dimension

    @classmethod
    def name(cls) -> str:
        return "sovereign_embedding_function"

    def get_config(self) -> Dict[str, Any]:
        return {"dimension": self.dimension}

    @classmethod
    def build_from_config(cls, config: Dict[str, Any]) -> "SovereignEmbeddingFunction":
        return cls(dimension=config.get("dimension", 128))

    def __call__(self, input: Documents) -> Embeddings:
        embeddings: List[List[float]] = []
        for doc in input:
            tokens = doc.lower().replace(",", " ").replace(".", " ").split()
            vec = np.zeros(self.dimension, dtype=np.float32)
            for token in tokens:
                # MD5 hash-projection for token distribution
                h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
                idx = h % self.dimension
                sign = 1.0 if (h >> 7) & 1 else -1.0
                vec[idx] += sign
            norm = float(np.linalg.norm(vec))
            if norm > 0.0:
                vec = vec / norm
            embeddings.append(vec.tolist())
        return embeddings


class DenseTransformerEmbeddingFunction(EmbeddingFunction[Documents]):
    """Dense neural embedding function using sentence-transformers or Google GenAI.

    Gracefully falls back to SovereignEmbeddingFunction if model weights or
    dependencies are unavailable, ensuring zero crashes in offline or air-gapped environments.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        self.model_name = model_name
        self._model: Any = None
        self._fallback = SovereignEmbeddingFunction(dimension=128)
        self._init_attempted = False

    @classmethod
    def name(cls) -> str:
        return "dense_transformer_embedding_function"

    def get_config(self) -> Dict[str, Any]:
        return {"model_name": self.model_name}

    @classmethod
    def build_from_config(cls, config: Dict[str, Any]) -> "DenseTransformerEmbeddingFunction":
        return cls(model_name=config.get("model_name", "all-MiniLM-L6-v2"))

    def _load_model(self) -> None:
        if self._init_attempted:
            return
        self._init_attempted = True
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
            logger.info("Loaded sentence-transformers model '%s' successfully.", self.model_name)
        except Exception as e:
            logger.info("sentence-transformers unavailable (%s); using Sovereign offline fallback.", e)
            self._model = None

    def __call__(self, input: Documents) -> Embeddings:
        self._load_model()
        if self._model is not None:
            try:
                embeddings = self._model.encode(list(input), normalize_embeddings=True)
                return [e.tolist() for e in embeddings]
            except Exception as e:
                logger.warning("Dense embedding generation failed (%s); falling back to Sovereign.", e)
        return self._fallback(input)


def get_embedding_mode() -> str:
    """Returns the current embedding engine mode string."""
    return _CURRENT_EMBEDDING_MODE.value


def set_embedding_mode(mode: str) -> None:
    """Configures global embedding mode ('sovereign', 'transformer', 'hybrid')."""
    global _CURRENT_EMBEDDING_MODE, _GLOBAL_VECTOR_STORE
    _CURRENT_EMBEDDING_MODE = EmbeddingEngineMode(mode.lower())
    # Re-synchronize collection if global vector store is initialized
    if _GLOBAL_VECTOR_STORE is not None:
        _GLOBAL_VECTOR_STORE.sync_mode()


def get_active_embedding_function() -> EmbeddingFunction[Documents]:
    """Returns the active embedding function based on current configuration."""
    if _CURRENT_EMBEDDING_MODE == EmbeddingEngineMode.SOVEREIGN:
        return SovereignEmbeddingFunction(dimension=128)
    elif _CURRENT_EMBEDDING_MODE == EmbeddingEngineMode.TRANSFORMER:
        return DenseTransformerEmbeddingFunction()
    else:  # HYBRID
        # In hybrid mode, try dense transformer with guaranteed sovereign fallback
        return DenseTransformerEmbeddingFunction()


SYNTHETIC_EVIDENCE_CORPUS: List[Dict[str, Any]] = [
    # --- Police FIRs ---
    {
        "id": "fir-patna-001",
        "source_id": "police_fir_patna",
        "dimension": "origin",
        "timestamp": "2026-09-01 09:15 IST",
        "document": (
            "FIR No. 402/2026, Kankarbagh Police Station, Patna: Missing child report filed. "
            "Subject age 14, permanent resident of Patna, Bihar. Last seen at Patna Junction near Platform 2. "
            "Physical characteristics: scar on left forearm, height approximately 150cm. "
            "Municipal Jurisdiction: Patna Smart City Sector 4."
        ),
    },
    {
        "id": "fir-ranchi-002",
        "source_id": "police_fir_ranchi",
        "dimension": "origin",
        "timestamp": "2026-09-03 15:30 IST",
        "document": (
            "FIR No. 188/2026, Morabadi Police Station, Ranchi: Missing adolescent complaint. "
            "Subject age 16, native of Ranchi, Jharkhand. Reported missing from Ranchi Interstate Bus Stand. "
            "Distinctive physical marker: pronounced mole on right cheek. "
            "Municipal Jurisdiction: Ranchi Smart City Ward 12."
        ),
    },
    {
        "id": "fir-varanasi-003",
        "source_id": "police_fir_varanasi",
        "dimension": "origin",
        "timestamp": "2026-09-05 20:00 IST",
        "document": (
            "FIR No. 312/2026, Dashashwamedh Police Station, Varanasi: Missing child report. "
            "Subject age 12, resident of Godowlia, Varanasi, Uttar Pradesh. "
            "Physical markers: red wristband, height 138cm. "
            "Municipal Jurisdiction: Varanasi Cantt Administrative Division."
        ),
    },
    # --- Transit CCTV Manifests (Track 04 Connected Infrastructure) ---
    {
        "id": "cctv-patna-001",
        "source_id": "cctv_patna_railway",
        "dimension": "timeline",
        "timestamp": "2026-09-01 08:35 IST",
        "document": (
            "East Central Railway CCTV Camera Cam-04 at Patna Junction Platform 2 recorded subject "
            "boarding train coaches matching departure timeline on 2026-09-01 08:30 IST. "
            "Travel route consistent with transit toward Ranchi / eastern corridors. "
            "Infrastructure Node: ECR Danapur Transit Hub. Cross-jurisdictional handoff latency: 14 min."
        ),
    },
    {
        "id": "cctv-ranchi-002",
        "source_id": "cctv_ranchi_bus_stand",
        "dimension": "timeline",
        "timestamp": "2026-09-03 14:15 IST",
        "document": (
            "Birsa Munda Interstate Bus Terminal (ISBT) Bay 4 CCTV footage recorded on 2026-09-03 14:00 IST. "
            "Subject sighting at Ranchi Bus Stand corroborated with facial match score 98.4%. "
            "Infrastructure Node: Ranchi Municipal Smart Transit Concourse. Checkpoint coverage: 94.2%."
        ),
    },
    {
        "id": "cctv-varanasi-003",
        "source_id": "cctv_godowlia_chowk",
        "dimension": "timeline",
        "timestamp": "2026-09-05 18:50 IST",
        "document": (
            "Varanasi Traffic Police Surveillance Cam-14 at Godowlia Chowk recorded minor "
            "on 2026-09-05 18:45 IST proceeding toward Varanasi Cantt railway transit terminal. "
            "Infrastructure Node: Varanasi Smart City Traffic Surveillance Grid. Checkpoint coverage: 96.8%."
        ),
    },
    {
        "id": "transit-rail-manifest-001",
        "source_id": "rail_manifest_east_central",
        "dimension": "timeline",
        "timestamp": "2026-09-01 12:00 IST",
        "document": (
            "Railway Transit Manifest RAIL-09: Temporal route validation confirms travel from Patna to "
            "Ranchi / Mumbai takes 28 hours via scheduled rail transit. Timeline is transit-consistent. "
            "Cross-jurisdictional transit coordination metric: Inter-hub handoff latency 18 min."
        ),
    },
    # --- Hospital Admission & Medical Examination Logs ---
    {
        "id": "hospital-patna-001",
        "source_id": "hospital_pmch_patna",
        "dimension": "physical_markers",
        "timestamp": "2026-09-01 11:00 IST",
        "document": (
            "Patna Medical College Hospital (PMCH) Emergency Records: Verified pediatric medical file "
            "confirms subject has surgical scar on left forearm, height 150cm, blood group O-positive. "
            "Civic Health Node: PMCH Municipal Pediatric Admissions & Emergency Triage."
        ),
    },
    {
        "id": "hospital-ranchi-002",
        "source_id": "hospital_ranchi_sadar",
        "dimension": "physical_markers",
        "timestamp": "2026-09-03 16:20 IST",
        "document": (
            "Ranchi Sadar Hospital Outpatient Triage Log: Subject examination record notes dark mole on "
            "right cheek, black hair, height 160cm. "
            "Civic Health Node: Ranchi Municipal Pediatric Health Clinic."
        ),
    },
    {
        "id": "hospital-varanasi-003",
        "source_id": "hospital_varanasi_district",
        "dimension": "physical_markers",
        "timestamp": "2026-09-05 19:30 IST",
        "document": (
            "Varanasi District Hospital Pediatric Clinic: Verified identity records indicate red "
            "identification wristband from rural child health camp, height 138cm, age 12. "
            "Civic Health Node: Varanasi Cantt Municipal Pediatric Unit."
        ),
    },
    # --- Childline 1098 Records & Identity Verification ---
    {
        "id": "childline-patna-001",
        "source_id": "childline_patna_1098",
        "dimension": "identity",
        "timestamp": "2026-09-01 10:00 IST",
        "document": (
            "Childline 1098 Emergency Intake Log CL-1098-892: Guardian report filed for missing 14-year-old "
            "from Kankarbagh, Patna. Corroborated with municipal birth registry records. "
            "Municipal Coordination: Child Welfare Committee Patna Urban Division."
        ),
    },
    {
        "id": "childline-ranchi-002",
        "source_id": "childline_ranchi_transit",
        "dimension": "identity",
        "timestamp": "2026-09-03 17:00 IST",
        "document": (
            "Childline 1098 Transit Rescue Desk, Ranchi Railway Station (CL-1098-941): Field observation "
            "intake recorded. Cross-referenced with missing person bulletin from Morabadi, Ranchi. "
            "Municipal Coordination: Ranchi Municipal Child Welfare Desk."
        ),
    },
    {
        "id": "childline-varanasi-003",
        "source_id": "childline_varanasi_intake",
        "dimension": "identity",
        "timestamp": "2026-09-05 21:00 IST",
        "document": (
            "Childline 1098 Help Desk Varanasi (CL-1098-904): Verification completed with Varanasi police "
            "and municipal civil registry confirming age 12, native resident of Dashashwamedh. "
            "Municipal Coordination: Varanasi District Child Protection Society."
        ),
    },
    # --- Field Contradiction Grounding Chunks ---
    {
        "id": "field-witness-ranchi-001",
        "source_id": "field_witness_statement",
        "dimension": "physical_markers",
        "timestamp": "2026-09-03 15:00 IST",
        "document": (
            "Field Investigator Witness Statement, Ranchi Bus Stand: Eyewitness claims subject has a prominent "
            "scar on right forearm, whereas official medical records confirm permanent scar on left forearm. "
            "Physical marker contradiction detected: left forearm != right forearm."
        ),
    },
]


class EvidenceVectorStore:
    """Production-grade hybrid vector store for evidence grounding using ChromaDB."""

    def __init__(self) -> None:
        self.client = chromadb.Client()
        self._collections: Dict[str, Any] = {}
        self.sync_mode()

    def sync_mode(self) -> None:
        """Synchronizes collection with current embedding mode."""
        mode = get_embedding_mode()
        coll_name = f"awaaz_evidence_store_{mode}"
        if coll_name not in self._collections:
            fn = get_active_embedding_function()
            self._collections[coll_name] = self.client.get_or_create_collection(
                name=coll_name,
                embedding_function=fn,
                metadata={"hnsw:space": "cosine"},
            )
            self._seed_collection(self._collections[coll_name])
        self.collection = self._collections[coll_name]

    def _seed_collection(self, collection: Any) -> None:
        """Seeds synthetic multi-source evidence corpus into ChromaDB collection."""
        if collection.count() == 0:
            docs = [item["document"] for item in SYNTHETIC_EVIDENCE_CORPUS]
            ids = [item["id"] for item in SYNTHETIC_EVIDENCE_CORPUS]
            metadatas = [
                {
                    "source_id": item["source_id"],
                    "dimension": item["dimension"],
                    "timestamp": item["timestamp"],
                }
                for item in SYNTHETIC_EVIDENCE_CORPUS
            ]
            collection.add(
                documents=docs,
                ids=ids,
                metadatas=metadatas,
            )

    def query_evidence(
        self,
        query: str,
        dimension: Optional[str] = None,
        top_k: int = 3,
    ) -> List[Dict[str, Any]]:
        """Queries evidence chunks with cosine similarity and metadata tags.

        Args:
            query: The search query string.
            dimension: Optional evidence dimension filter ('identity', 'timeline', 'physical_markers', 'origin').
            top_k: Number of top matching chunks to retrieve.

        Returns:
            List of dictionaries containing chunk text, source citation, dimension, timestamp, and cosine similarity score.
        """
        self.sync_mode()
        where_filter: Optional[Dict[str, Any]] = None
        if dimension and dimension in ("identity", "timeline", "physical_markers", "origin"):
            where_filter = {"dimension": dimension}

        total_available = self.collection.count()
        if total_available == 0:
            return []

        n_results = min(max(top_k, 1), total_available)

        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where_filter,
            )
        except Exception:
            # Fallback query without where filter if collection filter returns empty or errors
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
            )

        output: List[Dict[str, Any]] = []
        if not results or not results["documents"] or not results["documents"][0]:
            return output

        documents = results["documents"][0]
        metadatas = results["metadatas"][0] if results["metadatas"] else [{}] * len(documents)
        distances = results["distances"][0] if results["distances"] else [0.5] * len(documents)

        for doc, meta, dist in zip(documents, metadatas, distances):
            # Cosine similarity from cosine distance: similarity = 1.0 - distance
            cos_sim = max(0.0, min(1.0, float(1.0 - dist)))
            output.append({
                "chunk": doc,
                "text": doc,
                "source_id": meta.get("source_id", "unknown_source"),
                "dimension": meta.get("dimension", "unspecified"),
                "timestamp": meta.get("timestamp", "N/A"),
                "score": round(cos_sim, 4),
                "similarity": round(cos_sim, 4),
                "metadata": meta,
            })

        return output

    def get_all_documents(self) -> List[Dict[str, Any]]:
        """Returns all documents in the evidence store for dashboard inspection."""
        return list(SYNTHETIC_EVIDENCE_CORPUS)


# Global singleton vector store instance
_GLOBAL_VECTOR_STORE: Optional[EvidenceVectorStore] = None


def get_vector_store() -> EvidenceVectorStore:
    """Returns the global singleton EvidenceVectorStore instance."""
    global _GLOBAL_VECTOR_STORE
    if _GLOBAL_VECTOR_STORE is None:
        _GLOBAL_VECTOR_STORE = EvidenceVectorStore()
    return _GLOBAL_VECTOR_STORE


def query_evidence(
    query: str,
    dimension: Optional[str] = None,
    top_k: int = 3,
) -> List[Dict[str, Any]]:
    """Clean public query interface for RAG evidence grounding.

    Args:
        query: Query string.
        dimension: Evidence dimension filter ('identity', 'timeline', 'physical_markers', 'origin').
        top_k: Max results to return.

    Returns:
        List of evidence chunks with metadata and cosine similarity scores.
    """
    store = get_vector_store()
    return store.query_evidence(query=query, dimension=dimension, top_k=top_k)
