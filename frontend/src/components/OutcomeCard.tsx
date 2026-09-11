import React from 'react'
import type { DecisionExplanation, Contradiction } from '../types'
import { ShieldAlert, ShieldCheck, AlertCircle, FileQuestion } from 'lucide-react'

interface OutcomeCardProps {
  decision: string
  explanation: DecisionExplanation
  contradictions?: Contradiction[]
}

export const OutcomeCard: React.FC<OutcomeCardProps> = ({
  decision,
  explanation,
  contradictions = [],
}) => {
  if (decision === 'HOLD') {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(69, 10, 10, 0.7) 0%, rgba(127, 29, 29, 0.4) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(239, 68, 68, 0.6)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 12px 36px -4px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
            }}>
              <ShieldAlert size={22} color="#ef4444" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Deterministic Policy Engine • {explanation.rule_triggered || 'Rule 1'}
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fee2e2', letterSpacing: '-0.01em' }}>
                ESCALATION BLOCKED (HOLD)
              </h2>
            </div>
          </div>
          <span
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.06em',
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.45)',
            }}
          >
            HARD CONTRADICTION &gt; SIMILARITY
          </span>
        </div>

        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#fecaca', marginBottom: '0.6rem' }}>
          {explanation.rationale}
        </p>

        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '10px',
          padding: '0.9rem 1.1rem',
          fontSize: '0.85rem',
          color: '#fca5a5',
          lineHeight: 1.5,
          border: '1px solid rgba(239, 68, 68, 0.2)',
          marginBottom: '1rem',
        }}>
          <strong>Zero-Harm Governance Rationale:</strong> Automated escalation is strictly halted.
          Even with high biometric or facial similarity (e.g. 98.4%), physical ground-truth contradictions
          categorically override similarity scores to prevent false-positive child identification.
        </div>

        {contradictions.length > 0 && (
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identified Contradictions Breakdown
            </span>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {contradictions.map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.82rem',
                    color: '#fee2e2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <strong>Dimension:</strong> {c.dimension.toUpperCase()} &nbsp;|&nbsp;
                    <strong>Type:</strong> <span style={{ color: '#ef4444', fontWeight: 700 }}>{c.type}</span> &nbsp;|&nbsp;
                    <span>{c.reason}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#fca5a5', fontFamily: 'var(--font-mono)' }}>
                    {c.source_a} vs {c.source_b}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (decision === 'HUMAN_REVIEW_REQUIRED') {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.7) 0%, rgba(20, 83, 45, 0.4) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(16, 185, 129, 0.6)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 12px 36px -4px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
            }}>
              <ShieldCheck size={22} color="#10b981" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Deterministic Policy Engine • Rule 5 Satisfied
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d1fae5', letterSpacing: '-0.01em' }}>
                ESCALATION AUTHORIZED (HUMAN REVIEW QUEUED)
              </h2>
            </div>
          </div>
          <span
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.06em',
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            }}
          >
            CLEARED FOR HUMAN ADJUDICATION
          </span>
        </div>

        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#a7f3d0', marginBottom: '0.6rem' }}>
          {explanation.rationale}
        </p>

        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '10px',
          padding: '0.9rem 1.1rem',
          fontSize: '0.85rem',
          color: '#6ee7b7',
          lineHeight: 1.5,
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <strong>The Terminal State Guarantee:</strong> All 4 core dimensions have been cross-verified with zero hard contradictions
          and zero adversarial anomalies. Case is queued for formal adjudication by a designated human officer.
        </div>
      </div>
    )
  }

  if (decision === 'INVESTIGATE') {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(120, 53, 15, 0.6) 0%, rgba(146, 64, 14, 0.3) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(245, 158, 11, 0.6)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <AlertCircle size={22} color="#fbbf24" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fef3c7' }}>
            FURTHER INVESTIGATION DISPATCHED (INVESTIGATE)
          </h2>
        </div>
        <p style={{ fontSize: '0.95rem', color: '#fde68a' }}>{explanation.rationale}</p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(29, 78, 216, 0.3) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(59, 130, 246, 0.6)',
        borderRadius: '16px',
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <FileQuestion size={22} color="#60a5fa" />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dbeafe' }}>
          MANDATORY USER INPUT REQUIRED (REQUEST_INFORMATION)
        </h2>
      </div>
      <p style={{ fontSize: '0.95rem', color: '#bfdbfe' }}>{explanation.rationale}</p>
    </div>
  )
}
