import React from 'react'
import { Shield, EyeOff } from 'lucide-react'

export const PolicyRulesReference: React.FC = () => {
  const rules = [
    {
      rule: 'Rule 1',
      title: 'Hard Contradiction Override',
      condition: 'Any HARD contradiction detected across any dimension',
      decision: 'HOLD',
      badgeColor: '#ef4444',
      rationale: 'Hard Contradiction > Similarity: Physical biometric/marker discrepancies unconditionally override high statistical facial similarity scores to prevent catastrophic false positives.',
    },
    {
      rule: 'Rule 2',
      title: 'Adversarial Jailbreak Containment',
      condition: 'adversarial_injection_detected == True',
      decision: 'HOLD',
      badgeColor: '#ef4444',
      rationale: 'Security containment: Immediate shutdown upon detecting jailbreak payloads, DAN modes, or prompt manipulation.',
    },
    {
      rule: 'Rule 3',
      title: 'Mandatory Intake Integrity',
      condition: 'required_user_input_missing == True',
      decision: 'REQUEST_INFORMATION',
      badgeColor: '#3b82f6',
      rationale: 'Procedural integrity: Demands mandatory missing inputs before automated analysis proceeds.',
    },
    {
      rule: 'Rule 4',
      title: 'Evidence Dimension Incompleteness',
      condition: 'Any required dimension in UncertaintyBudget != CONFIRMED',
      decision: 'INVESTIGATE',
      badgeColor: '#f59e0b',
      rationale: 'Completeness check: Dispatches FastMCP investigators to gather unconfirmed dimensions.',
    },
    {
      rule: 'Rule 5',
      title: 'Unanimous Corroboration Clearance',
      condition: 'All required dimensions confirmed, 0 contradictions, 0 injections',
      decision: 'HUMAN_REVIEW_REQUIRED',
      badgeColor: '#10b981',
      rationale: 'Cleared for formal adjudication by a designated human case officer.',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Shield size={22} color="#10b981" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            Deterministic Policy Engine (Rules 1 – 5 Hierarchy)
          </h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
          Project Awaaz removes autonomous agent overreach by pairing LangGraph multi-agent reasoning
          with an immutable, zero-LLM deterministic policy engine evaluated in strict priority order.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {rules.map((r) => (
            <div
              key={r.rule}
              className="glass-card"
              style={{
                borderLeft: `4px solid ${r.badgeColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: '1 1 500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
                    {r.rule}: {r.title}
                  </span>
                  <span
                    style={{
                      background: `${r.badgeColor}22`,
                      color: r.badgeColor,
                      border: `1px solid ${r.badgeColor}55`,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.55rem',
                      borderRadius: '4px',
                    }}
                  >
                    ➔ {r.decision}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  <strong style={{ color: '#cbd5e1' }}>Trigger Condition:</strong> <code>{r.condition}</code>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.45 }}>
                  {r.rationale}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <EyeOff size={22} color="#a855f7" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
            Data Minimization Policy &amp; Quarantine Gate
          </h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
          In accordance with the Digital Personal Data Protection Act 2023 (DPDP) and GDPR, sensitive child identifiers
          (<code>exact_address</code>, <code>biometric_hash</code>, <code>contact_number</code>) are strictly sequestered
          at the tool boundary before database retrieval or LLM visibility.
          Any unauthorized parameter access immediately aborts the tool call with <strong>zero data exposure</strong>.
        </p>
      </div>
    </div>
  )
}
