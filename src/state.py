"""State schema and Pydantic models for Project Awaaz."""

from typing import Dict, Iterator, List, Literal, Optional, Union
from pydantic import BaseModel, Field, RootModel

ContradictionType = Literal["HARD", "SOFT"]
EvidenceStatus = Literal["CONFIRMED", "MISSING", "CONTRADICTED"]
DimensionName = Literal["identity", "timeline", "physical_markers", "origin"]

SUPPORTED_DIMENSIONS = ("identity", "timeline", "physical_markers", "origin")


class Contradiction(BaseModel):
    """Represents a contradiction identified between evidence sources."""

    dimension: str
    type: ContradictionType
    source_a: str
    source_b: str
    reason: str


class EvidenceDimension(BaseModel):
    """State of an evidence dimension within the case investigation."""

    required: bool
    status: EvidenceStatus
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score bounded between 0.0 and 1.0 inclusive",
    )
    sources: List[str] = Field(default_factory=list)
    next_action: Optional[str] = None


class UncertaintyBudget(RootModel[Dict[DimensionName, EvidenceDimension]]):
    """Dictionary mapping dimension names ('identity', 'timeline', 'physical_markers', 'origin')

    to their respective EvidenceDimension states.
    """

    root: Dict[DimensionName, EvidenceDimension] = Field(default_factory=dict)

    def __init__(
        self,
        root: Optional[Dict[DimensionName, EvidenceDimension]] = None,
        **kwargs: EvidenceDimension,
    ) -> None:
        if root is not None and kwargs:
            merged = dict(root)
            merged.update(kwargs)  # type: ignore[arg-type]
            super().__init__(root=merged)
        elif root is not None:
            super().__init__(root=root)
        elif kwargs:
            super().__init__(root=kwargs)  # type: ignore[arg-type]
        else:
            super().__init__(root={})

    def __getitem__(self, key: DimensionName) -> EvidenceDimension:
        return self.root[key]

    def __setitem__(self, key: DimensionName, value: EvidenceDimension) -> None:
        self.root[key] = value

    def __contains__(self, key: object) -> bool:
        return key in self.root

    def __iter__(self) -> Iterator[DimensionName]:
        return iter(self.root)

    def __len__(self) -> int:
        return len(self.root)

    def get(
        self,
        key: DimensionName,
        default: Optional[EvidenceDimension] = None,
    ) -> Optional[EvidenceDimension]:
        return self.root.get(key, default)

    def items(self):
        return self.root.items()

    def values(self):
        return self.root.values()

    def keys(self):
        return self.root.keys()

    def __getattr__(self, name: str) -> EvidenceDimension:
        if name != "root" and hasattr(self, "root") and name in self.root:
            return self.root[name]  # type: ignore[index]
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

    @classmethod
    def default_budget(cls, required: bool = True) -> "UncertaintyBudget":
        """Factory for a pristine initial uncertainty budget covering all 4 core dimensions."""
        return cls({
            dim: EvidenceDimension(
                required=required,
                status="MISSING",
                confidence=0.0,
                sources=[],
                next_action=None,
            )
            for dim in SUPPORTED_DIMENSIONS
        })


def calculate_entropy(budget: UncertaintyBudget) -> float:
    """Calculates case uncertainty entropy bounded between 0.0 (fully resolved) and 1.0 (unresolved).

    Measures the degree of uncorroborated evidence across all required dimensions.
    """
    required_dims = [dim for dim in budget.values() if dim.required]
    if not required_dims:
        return 0.0
    total_confidence = sum(
        dim.confidence if dim.status == "CONFIRMED" else 0.0
        for dim in required_dims
    )
    resolved_ratio = total_confidence / len(required_dims)
    return max(0.0, min(1.0, round(1.0 - resolved_ratio, 3)))


class CaseState(BaseModel):
    """Full LangGraph state for Project Awaaz case resolution agent."""

    case_id: str
    raw_intake: str
    uncertainty_budget: UncertaintyBudget
    contradictions: List[Contradiction] = Field(default_factory=list)
    adversarial_injection_detected: bool = False
    required_user_input_missing: bool = False
    history: List[str] = Field(default_factory=list)
    terminal_state: Optional[str] = None
    uncertainty_entropy: float = 1.0
    entropy_history: List[float] = Field(default_factory=list)
