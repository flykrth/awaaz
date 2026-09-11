"""FastMCP server implementing investigative and civic coordination tools for Project Awaaz with data minimization."""

import json
from typing import List
from fastmcp import FastMCP
from src.tools.mock_db import MockCaseDB

# Initialize FastMCP server instance
mcp = FastMCP("Awaaz_Investigative_Tools")


@mcp.tool()
def search_case_metadata(case_id: str, requested_fields: List[str]) -> str:
    """Query case metadata while strictly enforcing data minimization policies.

    Args:
        case_id: Case identifier (e.g., 'CASE-001').
        requested_fields: List of metadata field names requested by the agent.

    Returns:
        JSON string of allowed case fields, or an error message string if rejected.
    """
    try:
        data = MockCaseDB.query_metadata(case_id, requested_fields)
        return json.dumps(data)
    except ValueError as e:
        return str(e)
    except KeyError:
        return f"CASE_NOT_FOUND: Case '{case_id}' not found."


@mcp.tool()
def check_case_timeline(origin: str, dest: str, date: str) -> str:
    """Performs strict temporal validation for travel routes between case origin and sighting.

    Args:
        origin: Origin / departure location of the subject.
        dest: Destination or sighting location.
        date: Transit or sighting date.

    Returns:
        Mocked temporal validation assessment string.
    """
    return f"Route consistent: {origin} to {dest} takes 28 hours via RAIL-09"


@mcp.tool()
def allocate_civic_resources(case_id: str, priority_level: str, transit_hub: str) -> str:
    """Dispatches child protection alerts and transit surveillance priority flags across municipal checkpoints.

    Strictly prevents disclosure of minor PII adhering to municipal data minimization policies.

    Args:
        case_id: Case identifier (e.g., 'CASE-001').
        priority_level: Alert priority level ('HIGH', 'CRITICAL', 'STANDARD').
        transit_hub: Target municipal transit or civic facility (e.g. 'Patna Junction Platform 2', 'Birsa Munda ISBT').

    Returns:
        JSON string confirming municipal dispatch and zero-PII compliance.
    """
    if case_id not in MockCaseDB.CASES:
        return f"CASE_NOT_FOUND: Case '{case_id}' not found in municipal registry."

    # Safe metadata lookup (only safe fields: age, physical_markers)
    case_meta = MockCaseDB.query_metadata(case_id, ["age", "physical_markers"])

    dispatch_payload = {
        "status": "DISPATCHED",
        "case_id": case_id,
        "priority": priority_level.upper(),
        "transit_hub": transit_hub,
        "coordination_action": "Transit Surveillance Priority Flag & Child Protection Unit Alert",
        "pii_quarantine_enforced": True,
        "disclosed_attributes": {
            "age": case_meta.get("age"),
            "physical_markers": case_meta.get("physical_markers"),
        },
        "quarantined_attributes": list(MockCaseDB.SENSITIVE_FIELDS),
        "message": (
            f"Civic alert level '{priority_level.upper()}' registered at '{transit_hub}' for case '{case_id}'. "
            f"Zero minor PII disclosed under municipal data minimization policy."
        ),
    }
    return json.dumps(dispatch_payload)


if __name__ == "__main__":
    mcp.run()
