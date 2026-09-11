"""Unit tests for Project Awaaz investigative tools and strictly typed data minimization."""

import json
import pytest
from src.tools.mock_db import MockCaseDB
from src.tools.mcp_server import check_case_timeline, mcp, search_case_metadata


class TestMockCaseDB:
    """Tests for MockCaseDB repository data access and security policies."""

    def test_query_metadata_allowed_fields(self):
        """Verify querying safe fields returns correct data."""
        data = MockCaseDB.query_metadata("CASE-001", ["age", "origin"])
        assert data == {"age": 14, "origin": "Patna"}

        # Verify instance query also works identically
        db = MockCaseDB()
        instance_data = db.query_metadata("CASE-001", ["age", "origin"])
        assert instance_data == {"age": 14, "origin": "Patna"}

    @pytest.mark.parametrize(
        "sensitive_field",
        ["exact_address", "biometric_hash", "contact_number"],
    )
    def test_query_metadata_raises_on_sensitive_fields(self, sensitive_field):
        """Verify requesting any sensitive field raises ValueError immediately."""
        with pytest.raises(
            ValueError,
            match="^UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy.$",
        ):
            MockCaseDB.query_metadata("CASE-001", ["age", sensitive_field])

    def test_query_metadata_nonexistent_case(self):
        """Verify querying non-existent case raises KeyError when safe fields requested."""
        with pytest.raises(KeyError):
            MockCaseDB.query_metadata("CASE-999", ["age"])

    def test_query_metadata_unauthorized_blocked_before_case_lookup(self):
        """Verify sensitive field access is blocked even if case does not exist."""
        with pytest.raises(
            ValueError,
            match="^UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy.$",
        ):
            MockCaseDB.query_metadata("NON_EXISTENT_CASE", ["exact_address"])


class TestMCPServerTools:
    """Tests for FastMCP investigative tools."""

    def test_search_case_metadata_allowed_fields(self):
        """Verify search_case_metadata returns JSON string of allowed fields."""
        result_str = search_case_metadata("CASE-001", ["age", "origin"])
        data = json.loads(result_str)

        assert data == {"age": 14, "origin": "Patna"}
        assert "exact_address" not in data
        assert "biometric_hash" not in data
        assert "contact_number" not in data

    def test_search_case_metadata_blocks_sensitive_fields_with_zero_exposure(self):
        """Verify requesting ['age', 'exact_address'] triggers UNAUTHORIZED_FIELD_ACCESS and exposes zero sensitive data."""
        result_str = search_case_metadata("CASE-001", ["age", "exact_address"])

        # Must return the specific rejection message
        assert result_str == "UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy."

        # Verify zero exposure of sensitive data
        assert "House No. 42" not in result_str
        assert "Kankarbagh" not in result_str
        assert "800020" not in result_str
        # Verify even the safe data was dropped upon unauthorized access
        assert "14" not in result_str

    @pytest.mark.parametrize(
        "blocked_request",
        [
            ["biometric_hash"],
            ["contact_number"],
            ["age", "physical_markers", "exact_address"],
            ["exact_address", "biometric_hash", "contact_number"],
        ],
    )
    def test_search_case_metadata_blocks_all_unauthorized_variations(self, blocked_request):
        """Verify all combinations containing unauthorized fields are rejected."""
        result_str = search_case_metadata("CASE-001", blocked_request)
        assert result_str == "UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy."

    def test_search_case_metadata_nonexistent_case(self):
        """Verify querying non-existent case returns error string gracefully."""
        result_str = search_case_metadata("CASE-999", ["age"])
        assert "CASE_NOT_FOUND" in result_str

    def test_check_case_timeline(self):
        """Verify check_case_timeline returns expected route consistency validation."""
        result = check_case_timeline("Patna", "Mumbai", "2026-09-01")
        expected = "Route consistent: Patna to Mumbai takes 28 hours via RAIL-09"
        assert result == expected

    def test_mcp_call_tool_interface(self):
        """Verify FastMCP call_tool interface handles requests and data minimization."""
        import asyncio

        async def _run():
            # Test valid metadata query via FastMCP
            res = await mcp.call_tool(
                "search_case_metadata",
                {"case_id": "CASE-001", "requested_fields": ["age", "origin"]},
            )
            assert res.is_error is False
            assert json.loads(res.content[0].text) == {"age": 14, "origin": "Patna"}

            # Test unauthorized metadata query via FastMCP
            blocked_res = await mcp.call_tool(
                "search_case_metadata",
                {"case_id": "CASE-001", "requested_fields": ["age", "exact_address"]},
            )
            assert blocked_res.content[0].text == (
                "UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy."
            )

            # Test timeline check via FastMCP
            timeline_res = await mcp.call_tool(
                "check_case_timeline",
                {"origin": "Patna", "dest": "Mumbai", "date": "2026-09-01"},
            )
            assert timeline_res.content[0].text == (
                "Route consistent: Patna to Mumbai takes 28 hours via RAIL-09"
            )

            # Test allocate_civic_resources via FastMCP
            dispatch_res = await mcp.call_tool(
                "allocate_civic_resources",
                {"case_id": "CASE-001", "priority_level": "HIGH", "transit_hub": "Patna Junction"},
            )
            assert dispatch_res.is_error is False
            d_data = json.loads(dispatch_res.content[0].text)
            assert d_data["status"] == "DISPATCHED"
            assert d_data["pii_quarantine_enforced"] is True
            assert "exact_address" not in d_data["disclosed_attributes"]

        asyncio.run(_run())

    def test_allocate_civic_resources_direct(self):
        """Verify allocate_civic_resources dispatches alert and enforces zero PII disclosure."""
        from src.tools.mcp_server import allocate_civic_resources

        res_str = allocate_civic_resources("CASE-001", "CRITICAL", "Patna Junction Platform 2")
        data = json.loads(res_str)

        assert data["status"] == "DISPATCHED"
        assert data["priority"] == "CRITICAL"
        assert data["transit_hub"] == "Patna Junction Platform 2"
        assert data["pii_quarantine_enforced"] is True
        assert "exact_address" not in data["disclosed_attributes"]
        assert "biometric_hash" not in data["disclosed_attributes"]
        assert "contact_number" not in data["disclosed_attributes"]
        assert "House No. 42" not in res_str
        assert "+91-9876543210" not in res_str

    def test_allocate_civic_resources_nonexistent_case(self):
        """Verify allocate_civic_resources handles non-existent cases gracefully."""
        from src.tools.mcp_server import allocate_civic_resources

        res_str = allocate_civic_resources("CASE-999", "STANDARD", "Birsa Munda ISBT")
        assert "CASE_NOT_FOUND" in res_str
