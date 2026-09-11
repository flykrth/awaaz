"""Real-time prompt injection and jailbreak defense for Project Awaaz."""

import re
from typing import Any, Dict, List, Tuple

# Comprehensive regex patterns matching known prompt injection, override, and jailbreak vectors
ADVERSARIAL_PATTERNS: List[Tuple[str, str]] = [
    # 1. Directive and Policy Overrides
    (r"ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions?", "Directive override: ignore prior instructions"),
    (r"system\s+override", "System directive override"),
    (r"admin\s+override", "Administrative privilege override"),
    (r"operator\s+directive", "Operator directive override"),
    (r"override\s+all\s+(?:governance|contradiction|policy)", "Override governance/contradiction check"),
    (r"disregard\s+(?:evidence\s+gaps|policy|governance|rules)", "Disregard evidence rules"),

    # 2. Jailbreak Persona Triggers
    (r"\bdan\s+mode\b", "Jailbreak persona: DAN mode"),
    (r"unrestricted\s+ai", "Jailbreak trigger: unrestricted AI"),
    (r"developer\s+mode\s+enabled", "Jailbreak trigger: developer mode"),
    (r"system\s+prompt\s+has\s+been\s+reset", "System prompt reset injection"),

    # 3. Guardrail & Policy Engine Bypasses
    (r"bypass\s+(?:guardrails?|policy\s+engine|critic|governance)", "Guardrail/policy bypass attempt"),
    (r"without\s+verification", "Policy evasion: without verification"),
    (r"proceed\s+directly\s+to\s+finalization", "Workflow bypass attempt"),
    (r"waive\s+(?:all\s+)?uncertainty\s+budgets?", "Uncertainty budget waiver probe"),

    # 4. Data Exfiltration & Sensitive Attribute Harvesting Probes
    (r"(?:dump|print|reveal|leak|exfiltrate)\s+(?:exact_address|biometric_hash|contact_number)", "Sensitive data exfiltration probe"),
    (r"disclose\s+(?:hidden\s+)?database\s+schemas?", "Database schema probe"),
    (r"repeat\s+all\s+system\s+prompts?", "Prompt leakage probe"),

    # 5. Cloaking & Injection Formatting
    (r"<!--\s*ADMIN\s+OVERRIDE", "HTML comment cloaking injection"),
    (r"\}\s*(?:\\n)*\s*Human:\s*", "Role confusion delimiter injection"),
    (r"force\s+approve\s+case", "Force approval injection"),
    (r"grant\s+immediate\s+clearance", "Immediate clearance bypass"),
]


def scan_prompt_injection(text: str) -> Dict[str, Any]:
    """Scans case intake text in real-time for adversarial prompt injection and jailbreaks.

    Args:
        text: Raw case intake text.

    Returns:
        Dict containing:
            - detected: bool indicating whether malicious patterns were identified
            - patterns_triggered: list of human-readable pattern descriptions
            - confidence: float score (1.0 if triggered, 0.0 if clean)
            - reason: explanatory string
    """
    if not text or not isinstance(text, str):
        return {
            "detected": False,
            "patterns_triggered": [],
            "confidence": 0.0,
            "reason": "Intake text empty or non-string.",
        }

    triggered: List[str] = []

    for pattern_regex, description in ADVERSARIAL_PATTERNS:
        if re.search(pattern_regex, text, re.IGNORECASE):
            triggered.append(description)

    if triggered:
        return {
            "detected": True,
            "patterns_triggered": triggered,
            "confidence": 1.0,
            "reason": f"Adversarial prompt injection detected: {'; '.join(triggered)}",
        }

    return {
        "detected": False,
        "patterns_triggered": [],
        "confidence": 0.0,
        "reason": "Zero adversarial injection patterns detected. Intake text passed security inspection.",
    }


def is_jailbreak(text: str) -> bool:
    """Convenience boolean check for adversarial prompt injection."""
    return scan_prompt_injection(text)["detected"]
