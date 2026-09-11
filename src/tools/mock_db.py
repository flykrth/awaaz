"""Mock database repository for Project Awaaz enforcing strictly typed data minimization."""

import functools
from typing import Any, Callable, Dict, List, Optional, Set


class _HybridQueryMetadata:
    """Descriptor allowing query_metadata to be called as either a class method or instance method."""

    def __init__(self, fn: Callable[..., Dict[str, Any]]) -> None:
        self.fn = fn

    def __get__(
        self, instance: Optional["MockCaseDB"], owner: Optional[type] = None
    ) -> Callable[[str, List[str]], Dict[str, Any]]:
        if instance is not None:
            @functools.wraps(self.fn)
            def wrapper(case_id: str, requested_fields: List[str]) -> Dict[str, Any]:
                return instance._execute_query(instance.cases, case_id, requested_fields)
            return wrapper
        else:
            assert owner is not None
            @functools.wraps(self.fn)
            def wrapper(case_id: str, requested_fields: List[str]) -> Dict[str, Any]:
                return owner._execute_query(owner.CASES, case_id, requested_fields)
            return wrapper


class MockCaseDB:
    """Mock repository containing synthetic cases with strict data minimization enforcement."""

    SENSITIVE_FIELDS: Set[str] = {
        "exact_address",
        "biometric_hash",
        "contact_number",
    }

    SAFE_FIELDS: Set[str] = {
        "age",
        "origin",
        "timeline",
        "physical_markers",
    }

    CASES: Dict[str, Dict[str, Any]] = {
        "CASE-001": {
            "case_id": "CASE-001",
            "age": 14,
            "origin": "Patna",
            "timeline": "Last seen at Patna Junction on 2026-09-01 08:30 IST",
            "physical_markers": "Scar on left forearm, height 150cm",
            "exact_address": "House No. 42, Ward 7, Kankarbagh, Patna, Bihar 800020",
            "biometric_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            "contact_number": "+91-9876543210",
        },
        "CASE-002": {
            "case_id": "CASE-002",
            "age": 16,
            "origin": "Ranchi",
            "timeline": "Reported missing from Ranchi Bus Stand on 2026-09-03 14:00 IST",
            "physical_markers": "Mole on right cheek, black hair",
            "exact_address": "Flat 302, Green Valley Apartments, Morabadi, Ranchi, Jharkhand 834008",
            "biometric_hash": "sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
            "contact_number": "+91-9123456780",
        },
        "CASE-003": {
            "case_id": "CASE-003",
            "age": 12,
            "origin": "Varanasi",
            "timeline": "Missing from Godowlia Chowk since 2026-09-05 18:45 IST",
            "physical_markers": "Wearing red wristband, height 138cm",
            "exact_address": "Plot 12, Dashashwamedh Road, Varanasi, Uttar Pradesh 221001",
            "biometric_hash": "sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
            "contact_number": "+91-9988776655",
        },
    }

    def __init__(self, cases: Optional[Dict[str, Dict[str, Any]]] = None) -> None:
        self.cases = cases if cases is not None else dict(self.CASES)

    @classmethod
    def _execute_query(
        cls,
        cases: Dict[str, Dict[str, Any]],
        case_id: str,
        requested_fields: List[str],
    ) -> Dict[str, Any]:
        """Validates requested fields and retrieves allowed case metadata.

        Raises:
            ValueError: If any sensitive field is included in requested_fields.
            KeyError: If case_id does not exist.
        """
        # Crucial Security Logic: Inside query_metadata, if requested_fields contains any of
        # ["exact_address", "biometric_hash", "contact_number"], raise a
        # ValueError("UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy.")
        for field in requested_fields:
            if field in cls.SENSITIVE_FIELDS:
                raise ValueError("UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy.")

        if case_id not in cases:
            raise KeyError(f"Case '{case_id}' not found.")

        case = cases[case_id]
        return {field: case[field] for field in requested_fields if field in case}

    @_HybridQueryMetadata
    def query_metadata(case_id: str, requested_fields: List[str]) -> Dict[str, Any]:
        """Query case metadata while strictly enforcing data minimization policies.

        Args:
            case_id: Identifier of the case to look up.
            requested_fields: List of metadata field names requested.

        Returns:
            Dict containing the requested allowed fields that are present in the case record.

        Raises:
            ValueError: If any unauthorized field is requested.
            KeyError: If case_id does not exist.
        """
        ...
