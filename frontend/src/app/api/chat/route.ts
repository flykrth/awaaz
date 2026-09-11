import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are the Project Awaaz Agentic AI Supervisory Assistant.
Project Awaaz is an evidence-grounded, deterministic multi-agent governance architecture designed to ensure zero-harm, privacy-preserving case resolution for high-stakes missing-child investigations across connected municipal infrastructure.

Core Architecture Knowledge:
1. The 3+1 LangGraph Planes:
   - Plane 1: Case Manager Agent (3-Tier adversarial jailbreak scan: Tier 1 regex, Tier 2 structural entropy, Tier 3 semantic intent audit; dynamic uncertainty budget routing).
   - Plane 2: FastMCP & ChromaDB Investigators (Evidence Investigator queries allowed metadata; Context Investigator validates temporal transit routes across East Central Railway, Birsa Munda ISBT, and Varanasi Smart City CCTV).
   - Plane 3: Safety Critic Agent (Dual-Mode LLM contradiction audit distinguishing HARD anatomical conflicts from soft timeline ambiguities).
   - The +1 Plane: Deterministic Policy Engine (Zero-LLM governance applying Rules 1 to 5).

2. The Signature Contradiction Theorem:
   - Rule 1: "HARD CONTRADICTION > SIMILARITY". Even if AI facial candidate similarity is 94% or 98.4%, physical ground-truth anatomical contradictions (e.g. left forearm scar != right forearm scar in CASE-002) categorically halt automated escalation to prevent catastrophic false positives. Terminal State = HOLD.

3. FastMCP Pre-LLM Data Minimization Gate:
   - Sensitive fields ('exact_address', 'biometric_hash', 'contact_number') are quarantined at the database descriptor schema level.
   - Any query attempting to access these fields raises ValueError("UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy.") before payloads can enter model token contexts. 0 sensitive fields are ever exposed.

4. Strict Governance Mandate:
   - "The AI cannot authorize interventions. Human review is mandatory. All real-world civic actions require certified officer sign-off."

5. Interactive Widget Triggers:
   When answering questions where an interactive demonstration is helpful, you MUST append one or more of the following exact action tokens at the very end of your response:
   - [[ACTION:SHOW_SIGNATURE_CARD]] : When explaining CASE-002, the contradiction override theorem, or physical marker conflicts.
   - [[ACTION:RUN_CASE_001]] : When demonstrating CASE-001 (Missing Timeline investigation).
   - [[ACTION:RUN_CASE_003]] : When demonstrating CASE-003 (Clean Evidence corroboration and human adjudicator sign-off).
   - [[ACTION:PROBE_QUARANTINE]] : When explaining FastMCP, data minimization, or PII protection.
   - [[ACTION:SHOW_TRACE]] : When explaining the 3+1 LangGraph execution planes.
   - [[ACTION:SHOW_ENTROPY]] : When explaining the uncertainty entropy reduction curve H(S).

Respond with authority, precision, and clarity. Format your answers in professional markdown with concise bullet points and bold highlights. Never use emojis.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, apiKey } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "A message string is required." }, { status: 400 });
    }

    const key = apiKey || process.env.GEMINI_API_KEY;

    if (key) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });

        // Build conversation history contents
        const contents: any[] = [];

        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item.role === "user") {
              contents.push({ role: "user", parts: [{ text: item.content }] });
            } else if (item.role === "assistant") {
              contents.push({ role: "model", parts: [{ text: item.content }] });
            }
          }
        }

        // Add current user message
        contents.push({ role: "user", parts: [{ text: message }] });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
          },
        });

        const reply = response.text || "No response generated.";
        return NextResponse.json({
          reply,
          mode: "gemini",
          model: "gemini-2.5-flash",
        });
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, using sovereign knowledge engine:", geminiError?.message);
      }
    }

    // Sovereign Knowledge Grounding Fallback
    const sovereignReply = generateSovereignReply(message);
    return NextResponse.json({
      reply: sovereignReply,
      mode: "sovereign",
      model: "Sovereign Knowledge Engine (Offline Grounded)",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process message." }, { status: 500 });
  }
}

function generateSovereignReply(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes("contradiction") || lower.includes("case-002") || lower.includes("case 2") || lower.includes("override") || lower.includes("similarity")) {
    return `### The Signature Contradiction Override Theorem

In high-stakes missing-child recovery, Large Language Models and facial recognition models frequently exhibit **confirmation bias**: when biometric similarity is high (e.g., 94% or 98.4%), unconstrained models tend to dismiss subtle conflicting physical markers as sensor noise or minor reporting errors.

**Project Awaaz eliminates this hazard through Policy Rule 1:**
$$\\text{HARD CONTRADICTION} > \\text{SIMILARITY}$$

In **CASE-002**, the sighting generated a **98.4% optical match** at the Ranchi Interstate Bus Terminal (ISBT Bay 4). However:
- **Field Report:** Subject observed with a prominent scar on the **RIGHT** forearm.
- **Verified Primary Record:** Official case dossier confirms scar on the **LEFT** forearm.

The Safety Critic Agent classifies this discrepancy as a **HARD Anatomical Contradiction**. The Deterministic Policy Engine immediately overrides the high biometric match, halts automated escalation, and locks the case in the **HOLD** state.

[[ACTION:SHOW_SIGNATURE_CARD]]`;
  }

  if (lower.includes("quarantine") || lower.includes("fastmcp") || lower.includes("data minimization") || lower.includes("pii") || lower.includes("probe") || lower.includes("privacy")) {
    return `### FastMCP Pre-LLM Data Minimization Gate

To prevent catastrophic PII leakage and exploitation risks, Project Awaaz enforces a strict **Pre-LLM Data Minimization Schema Gate** built into the FastMCP tool boundary and \`MockCaseDB.query_metadata()\`.

**Key Safeguards:**
- **Quarantined Sensitive Fields:**
  - \`exact_address\` (Residential street address of minor)
  - \`biometric_hash\` (Raw cryptographic biometric embedding)
  - \`contact_number\` (Guardian telephone contact)
- **Deterministic Enforcement:** If an agent attempts to query any of these fields, the gate throws an immediate \`ValueError("UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy.")\` before any token reaches the LLM context.
- **Audited Safe Metadata:** Only coarsened attributes required for routing (\`age\`, \`origin\`, \`timeline\`, \`physical_markers\`) are returned.

[[ACTION:PROBE_QUARANTINE]]`;
  }

  if (lower.includes("langgraph") || lower.includes("plane") || lower.includes("architecture") || lower.includes("agent") || lower.includes("3+1")) {
    return `### The 3+1 LangGraph Planes Architecture

Project Awaaz organizes reasoning, investigation, adversarial verification, and governance into **four decoupled execution planes**:

1. **Plane 1: Case Manager Agent**
   - Conducts 3-tier adversarial security audit (heuristics, structural entropy, semantic intent).
   - Formulates dynamic Uncertainty Budget ($H = 1.00$) and routes investigations based on missing dimensions.

2. **Plane 2: FastMCP & ChromaDB Investigators**
   - **Evidence Investigator:** Queries allowed metadata via FastMCP while respecting Pre-LLM quarantine.
   - **Context Investigator:** Validates temporal travel routes across East Central Railway and interstate bus schedules.

3. **Plane 3: Safety Critic Agent**
   - Dual-Mode LLM contradiction auditor that distinguishes between soft timeline noise and hard anatomical discrepancies.

4. **The +1 Plane: Deterministic Policy Engine**
   - Immutable, zero-LLM governance applying Rules 1-5 to determine terminal states: \`HOLD\`, \`INVESTIGATE\`, \`REQUEST_INFORMATION\`, or \`HUMAN_REVIEW_REQUIRED\`.

[[ACTION:SHOW_TRACE]]`;
  }

  if (lower.includes("case-001") || lower.includes("case 1") || lower.includes("missing timeline")) {
    return `### CASE-001: Missing Timeline Investigation

**Scenario Overview:**
- Primary records verify the subject's identity, origin (Patna), and physical markers (scar on left forearm).
- However, the transit trajectory from Patna Junction remains unconfirmed across connecting legs.

**Agent Execution:**
1. The Case Manager detects \`timeline.status = MISSING\` and routes to the **Context Investigator**.
2. The investigator queries FastMCP \`check_case_timeline()\` and ChromaDB vector RAG for rail manifests.
3. Candidate route RAIL-09 confirms travel toward Danapur, but secondary transit remains unverified.
4. Policy Rule 4 triggers: Automated escalation is withheld, and the case transitions to **INVESTIGATE** to dispatch transit CCTV verification flags.

[[ACTION:RUN_CASE_001]]`;
  }

  if (lower.includes("case-003") || lower.includes("case 3") || lower.includes("clean evidence") || lower.includes("adjudicator") || lower.includes("sign-off") || lower.includes("human")) {
    return `### CASE-003: Clean Evidence & Human Adjudication

**Scenario Overview:**
- Complete documentary intake verified from Varanasi Smart City Grid (Godowlia Chowk Cam-14) and pediatric medical records.
- All four required dimensions (Identity, Origin, Timeline, Physical Markers) achieve 98% corroboration confidence with zero hard contradictions.

**Policy Rule 5 Enforcement:**
Because all evidence is corroborated with zero anomalies, the system authorizes transition to **HUMAN_REVIEW_REQUIRED**. In strict adherence to our core directive, **the AI halts autonomous action** and queues the case for a Certified Human Child Welfare Officer to sign off with a cryptographic clearance token.

[[ACTION:RUN_CASE_003]]`;
  }

  if (lower.includes("entropy") || lower.includes("uncertainty") || lower.includes("metric") || lower.includes("curve")) {
    return `### Uncertainty Entropy Reduction Metric $H(S)$

Project Awaaz mathematically formulates case resolution progress using an **Uncertainty Entropy Metric** $H(S) \\in [0, 1]$ defined in \`src/state.py\`:

- **$H = 1.00$ (Intake):** Represents completely unverified case records where all required dimensions are uncorroborated.
- **$H \\to 0.00$ (Resolution):** Monotonically decreases as agents corroborate evidence dimensions with high confidence and zero contradictions.
- **Halted Entropy:** If a hard contradiction is encountered (as in CASE-002), entropy reduction halts ($H = 0.85$), visually exposing the unresolved conflict.

[[ACTION:SHOW_ENTROPY]]`;
  }

  return `### Project Awaaz Agentic AI Governance Console

Project Awaaz pairs evidence-grounded multi-agent reasoning with deterministic zero-LLM policy enforcement across connected municipal infrastructure.

**Key Questions You Can Ask:**
- **Contradiction Override:** "How does the Signature Contradiction Override work? (Demo CASE-002)"
- **Data Minimization:** "How does the FastMCP Pre-LLM Quarantine Gate prevent PII leaks?"
- **Investigation Execution:** "Run an investigation on CASE-001 (Missing Timeline)"
- **Clean Corroboration:** "Show the Human Adjudicator Sign-Off workflow (CASE-003)"
- **System Architecture:** "Explain the 3+1 LangGraph Planes and how they coordinate"
- **Mathematical Grounding:** "Explain the Uncertainty Entropy Reduction Metric H(S)"

[[ACTION:SHOW_TRACE]]`;
}
