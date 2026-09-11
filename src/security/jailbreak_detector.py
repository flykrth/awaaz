"""Real-time multi-layered prompt injection and adversarial jailbreak defense for Project Awaaz.

Implements a 3-Tier Defense Shield:
- Tier 1: Heuristic Pattern & Directive Override Matching (Expanded Regex)
- Tier 2: Structural & Entropy Analysis (Role Hijacking, JSON Smuggling, Character Obfuscation)
- Tier 3: Sovereign Semantic Safety Audit (Intent Risk Scoring 0.0 - 1.0)
"""

import math
import re
from typing import Any, Dict, List, Tuple

# =========================================================================
# TIER 1: Heuristic Pattern & Directive Override Matching
# =========================================================================
ADVERSARIAL_PATTERNS: List[Tuple[str, str]] = [
    # 1. Directive and Policy Overrides
    (r"ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions?", "Directive override: ignore prior instructions"),
    (r"system\s+override", "System directive override"),
    (r"admin\s+override", "Administrative privilege override"),
    (r"operator\s+directive", "Operator directive override"),
    (r"override\s+all\s+(?:governance|contradiction|policy|rules)", "Override governance/contradiction check"),
    (r"disregard\s+(?:evidence\s+gaps|policy|governance|rules)", "Disregard evidence rules"),
    (r"disregard\s+(?:all\s+)?(?:rules|policies|guardrails)", "Disregard guardrails"),

    # 2. Jailbreak Persona Triggers
    (r"\bdan\s+mode\b", "Jailbreak persona: DAN mode"),
    (r"unrestricted\s+ai", "Jailbreak trigger: unrestricted AI"),
    (r"developer\s+mode\s+enabled", "Jailbreak trigger: developer mode"),
    (r"system\s+prompt\s+has\s+been\s+reset", "System prompt reset injection"),
    (r"jailbreak\s+active", "Jailbreak active probe"),

    # 3. Guardrail & Policy Engine Bypasses
    (r"bypass\s+(?:guardrails?|policy\s+engine|critic|governance)", "Guardrail/policy bypass attempt"),
    (r"without\s+verification", "Policy evasion: without verification"),
    (r"proceed\s+directly\s+to\s+finalization", "Workflow bypass attempt"),
    (r"waive\s+(?:all\s+)?uncertainty\s+budgets?", "Uncertainty budget waiver probe"),
    (r"grant\s+instantaneous\s+approval", "Instantaneous approval override"),
    (r"force\s+approve\s+case", "Force approval injection"),
    (r"grant\s+immediate\s+clearance", "Immediate clearance bypass"),

    # 4. Data Exfiltration & Sensitive Attribute Harvesting Probes
    (r"(?:dump|print|reveal|leak|exfiltrate)\s+(?:exact_address|biometric_hash|contact_number)", "Sensitive data exfiltration probe"),
    (r"disclose\s+(?:hidden\s+)?database\s+schemas?", "Database schema probe"),
    (r"repeat\s+all\s+system\s+prompts?", "Prompt leakage probe"),

    # 5. Cloaking & Injection Formatting
    (r"<!--\s*ADMIN\s+OVERRIDE", "HTML comment cloaking injection"),
    (r"<!--.*?override.*?-->", "HTML comment covert override"),
    (r"\}\s*(?:\\n)*\s*Human:\s*", "Role confusion delimiter injection"),
    (r"\[\s*SYSTEM\s*\]", "System bracket role injection"),
]


# =========================================================================
# TIER 2: Structural & Entropy Analysis
# =========================================================================
def analyze_structural_anomalies(text: str) -> List[str]:
    """Detects structural manipulation, role-hijacking delimiters, and character anomalies."""
    triggers: List[str] = []

    # 1. Role-hijacking delimiters (simulating user/assistant turn shifts)
    if re.search(r"(?:^|\n|\})\s*(?:Human|Assistant|System|User)\s*:", text, re.IGNORECASE):
        triggers.append("Role-hijacking conversational delimiter detected")

    # 2. JSON schema poisoning / prompt smuggling
    if re.search(r'\{\s*"(?:override|bypass|escalate|admin|system_override|grant_access)"\s*:', text, re.IGNORECASE):
        triggers.append("JSON schema payload smuggling attempt")

    # 3. Non-printable or zero-width obfuscation characters
    if re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\u200b-\u200f\ufeff]", text):
        triggers.append("Obfuscated non-printable or zero-width character anomaly")

    # 4. Excessive repetitive delimiter sequence (prompt boundary confusion)
    if re.search(r"={10,}|-{10,}|_{10,}|#{5,}\s*INSTRUCTION", text):
        triggers.append("Artificial prompt boundary delimiter sequence")

    return triggers


# =========================================================================
# TIER 3: Sovereign Semantic Safety Audit
# =========================================================================
def audit_intake_safety(intake_text: str) -> Dict[str, Any]:
    """Evaluates case intake text through a sovereign semantic classifier.

    Calculates an adversarial intent risk score bounded between 0.0 (benign) and 1.0 (malicious).
    Operates 100% offline with zero external network dependencies.

    Args:
        intake_text: Raw case intake text.

    Returns:
        Dict containing:
            - risk_score: float bounded between 0.0 and 1.0
            - intent_category: string classification ('BENIGN', 'SUSPICIOUS', 'MALICIOUS')
            - flagged_intents: list of identified coercive or privilege-escalation intents
    """
    if not intake_text or not isinstance(intake_text, str):
        return {
            "risk_score": 0.0,
            "intent_category": "BENIGN",
            "flagged_intents": [],
        }

    lower_text = intake_text.lower()
    flagged: List[str] = []
    risk_acc = 0.0

    # Coercive override verbs targeting governance
    override_verbs = ["override", "bypass", "disregard", "ignore", "waive", "force approve", "clearance"]
    for verb in override_verbs:
        if verb in lower_text:
            risk_acc += 0.35
            flagged.append(f"Coercive verb: '{verb}'")

    # High-value governance targets
    governance_targets = ["governance", "policy engine", "critic", "guardrail", "adjudicator", "system prompt", "schemas"]
    for target in governance_targets:
        if target in lower_text:
            risk_acc += 0.30
            flagged.append(f"Governance target: '{target}'")

    # PII harvesting intentions
    pii_targets = ["biometric_hash", "exact_address", "contact_number"]
    for pii in pii_targets:
        if pii in lower_text:
            risk_acc += 0.40
            flagged.append(f"PII probe target: '{pii}'")

    # Calculate bounded score
    final_score = max(0.0, min(1.0, round(risk_acc, 2)))
    category = "BENIGN"
    if final_score >= 0.70:
        category = "MALICIOUS"
    elif final_score >= 0.30:
        category = "SUSPICIOUS"

    return {
        "risk_score": final_score,
        "intent_category": category,
        "flagged_intents": flagged,
    }


# =========================================================================
# Unified Multi-Tier Defense Scanner
# =========================================================================
def scan_prompt_injection(text: str) -> Dict[str, Any]:
    """Scans case intake text across all 3 defense tiers in real-time.

    Args:
        text: Raw case intake text.

    Returns:
        Dict containing:
            - detected: bool indicating whether malicious patterns were identified
            - patterns_triggered: list of human-readable pattern descriptions
            - confidence: float score (1.0 if triggered, 0.0 if clean)
            - risk_score: semantic risk score (0.0 - 1.0)
            - defense_tier: string identifying which tiers flagged violations
            - reason: explanatory string
    """
    if not text or not isinstance(text, str):
        return {
            "detected": False,
            "patterns_triggered": [],
            "confidence": 0.0,
            "risk_score": 0.0,
            "defense_tier": "None",
            "reason": "Intake text empty or non-string.",
        }

    triggered: List[str] = []
    tiers_activated: List[str] = []

    # Tier 1: Heuristic Patterns
    tier1_matches: List[str] = []
    for pattern_regex, description in ADVERSARIAL_PATTERNS:
        if re.search(pattern_regex, text, re.IGNORECASE):
            tier1_matches.append(description)
    if tier1_matches:
        triggered.extend(tier1_matches)
        tiers_activated.append("Tier 1 (Heuristic Patterns)")

    # Tier 2: Structural & Entropy Analysis
    tier2_matches = analyze_structural_anomalies(text)
    if tier2_matches:
        triggered.extend(tier2_matches)
        tiers_activated.append("Tier 2 (Structural & Entropy Analysis)")

    # Tier 3: Sovereign Semantic Safety Audit
    semantic_audit = audit_intake_safety(text)
    if semantic_audit["risk_score"] >= 0.70 and not triggered:
        triggered.append(
            f"Tier 3 Semantic Risk Score {semantic_audit['risk_score']:.2f} (Category: {semantic_audit['intent_category']})"
        )
        tiers_activated.append("Tier 3 (Semantic Safety Audit)")

    if triggered:
        return {
            "detected": True,
            "patterns_triggered": triggered,
            "confidence": 1.0,
            "risk_score": max(semantic_audit["risk_score"], 1.0 if tier1_matches or tier2_matches else 0.70),
            "defense_tier": ", ".join(tiers_activated) if tiers_activated else "Tier 1",
            "reason": f"Adversarial prompt injection detected: {'; '.join(triggered)}",
        }

    return {
        "detected": False,
        "patterns_triggered": [],
        "confidence": 0.0,
        "risk_score": semantic_audit["risk_score"],
        "defense_tier": "None",
        "reason": "Zero adversarial injection patterns detected. Intake text passed security inspection across Tiers 1-3.",
    }


def is_jailbreak(text: str) -> bool:
    """Convenience boolean check for adversarial prompt injection."""
    return scan_prompt_injection(text)["detected"]
