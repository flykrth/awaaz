"""Standalone FastMCP Server Launcher for Project Awaaz.

Enables judges, developers, and external MCP clients (Claude Desktop, Cursor,
enterprise MCP gateways) to connect over standard stdio transport or Server-Sent Events (SSE).
"""

import argparse
import sys
from src.tools.mcp_server import mcp


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Launch Project Awaaz FastMCP Investigative & Civic Telemetry Server"
    )
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse"],
        default="stdio",
        help="MCP Transport mechanism: 'stdio' (default) or 'sse' (Server-Sent Events)",
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Host address for SSE transport (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port number for SSE transport (default: 8000)",
    )

    args = parser.parse_args()

    sys.stderr.write(
        f"[FastMCP] Initializing Awaaz investigative tools on transport='{args.transport}'...\n"
    )
    if args.transport == "sse":
        mcp.run(transport="sse", host=args.host, port=args.port)
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
