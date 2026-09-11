"""FastMCP server implementing investigative tools for Project Awaaz with data minimization."""

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
    except KeyError as e:
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


if __name__ == "__main__":
    mcp.run()
