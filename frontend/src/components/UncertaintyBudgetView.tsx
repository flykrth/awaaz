import React from 'react'
import type { UncertaintyBudget } from '../types'
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react'

interface UncertaintyBudgetViewProps {
  budget: UncertaintyBudget
  title?: string
}

export const UncertaintyBudgetView: React.FC<UncertaintyBudgetViewProps> = ({
  budget,
  title = 'Uncertainty Budget Matrix',
}) => {
  const dimensions = Object.entries(budget)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle2 size={13} color="#34d399" />
      case 'MISSING':
        return <AlertTriangle size={13} color="#fbbf24" />
      case 'CONTRADICTED':
        return <XCircle size={13} color="#f87171" />
      default:
        return null
    }
  }

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'badge-confirmed'
      case 'MISSING':
        return 'badge-missing'
      case 'CONTRADICTED':
        return 'badge-contradicted'
      default:
        return ''
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="#06b6d4" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            {title}
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
          4 Core Dimensions
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.85rem',
      }}>
        {dimensions.map(([dimName, dimVal]) => {
          const confPercent = Math.round(dimVal.confidence * 100)
          return (
            <div
              key={dimName}
              className="glass-card"
              style={{
                padding: '0.9rem',
                borderLeft: `3px solid ${
                  dimVal.status === 'CONFIRMED'
                    ? '#10b981'
                    : dimVal.status === 'CONTRADICTED'
                    ? '#ef4444'
                    : '#f59e0b'
                }`,
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem',
              }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  color: '#f8fafc',
                }}>
                  {dimName.replace('_', ' ')}
                </span>
                <span className={`badge ${getBadgeClass(dimVal.status)}`}>
                  {getStatusIcon(dimVal.status)}
                  {dimVal.status}
                </span>
              </div>

              {/* Confidence Meter */}
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  marginBottom: '0.2rem',
                }}>
                  <span>Confidence</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{confPercent}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '5px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      width: `${confPercent}%`,
                      height: '100%',
                      background:
                        dimVal.status === 'CONFIRMED'
                          ? 'linear-gradient(90deg, #059669, #10b981)'
                          : dimVal.status === 'CONTRADICTED'
                          ? '#ef4444'
                          : '#f59e0b',
                      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>

              {/* Sources */}
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                <span style={{ fontWeight: 600 }}>Sources: </span>
                {dimVal.sources && dimVal.sources.length > 0 ? (
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                    {dimVal.sources.join(', ')}
                  </span>
                ) : (
                  <span style={{ fontStyle: 'italic' }}>None verified</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
