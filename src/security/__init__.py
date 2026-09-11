"""Security package for Project Awaaz with prompt injection and jailbreak defense."""

from src.security.jailbreak_detector import (
    ADVERSARIAL_PATTERNS,
    is_jailbreak,
    scan_prompt_injection,
)

__all__ = [
    "ADVERSARIAL_PATTERNS",
    "is_jailbreak",
    "scan_prompt_injection",
]
