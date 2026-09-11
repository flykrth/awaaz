import { NextRequest, NextResponse } from "next/server";
import { probeFastMCPField, dispatchCivicResources } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "probe";

    if (action === "probe") {
      const field = body.field || "exact_address";
      const caseId = body.caseId || "CASE-002";
      const result = await probeFastMCPField(field, caseId);
      return NextResponse.json(result);
    }

    if (action === "dispatch") {
      const caseId = body.caseId || "CASE-001";
      const priority = body.priority || "CRITICAL";
      const transitHub = body.transitHub || "Patna Junction Platform 2";
      const result = await dispatchCivicResources(caseId, priority, transitHub);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
