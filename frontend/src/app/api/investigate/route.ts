import { NextRequest, NextResponse } from "next/server";
import { MOCK_RESULTS } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const caseId = body.caseId || "CASE-001";
    const result = MOCK_RESULTS[caseId];

    if (!result) {
      return NextResponse.json({ error: `Case '${caseId}' not found.` }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get("caseId") || "CASE-001";
  const result = MOCK_RESULTS[caseId];

  if (!result) {
    return NextResponse.json({ error: `Case '${caseId}' not found.` }, { status: 404 });
  }

  return NextResponse.json(result);
}
