import React from 'react'
import { Shield, Compass, Search, Clock, Scale, Cpu } from 'lucide-react'

interface GraphVisualizerProps {
  activeNode?: string | null
  executedNodes: string[]
  terminalState?: string | null
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  activeNode,
  executedNodes,
  terminalState,
}) => {
  const nodes = [
    {
      id: 'manager',
      title: 'Case Manager',
      plane: 'Plane 1: Routing',
      x: 140,
      y: 110,
      icon: Compass,
      color: '#3b82f6',
    },
    {
      id: 'evidence_inv',
      title: 'Evidence Investigator',
      plane: 'Plane 2: FastMCP',
      x: 340,
      y: 50,
      icon: Search,
      color: '#06b6d4',
    },
    {
      id: 'context_inv',
      title: 'Context Investigator',
      plane: 'Plane 2: FastMCP',
      x: 340,
      y: 170,
      icon: Clock,
      color: '#06b6d4',
    },
    {
      id: 'critic',
      title: 'Safety Critic',
      plane: 'Plane 3: Contradiction Audit',
      x: 540,
      y: 110,
      icon: Scale,
      color: '#f59e0b',
    },
    {
      id: 'policy_eval',
      title: 'Policy Engine (+1)',
      plane: 'Deterministic Governance',
      x: 740,
      y: 110,
      icon: Shield,
      color: terminalState === 'HOLD' ? '#ef4444' : '#10b981',
    },
  ]

  const isExecuted = (id: string) => executedNodes.includes(id)
  const isActive = (id: string) => activeNode === id

  return (
    <div style={{
      position: 'relative',
      background: 'rgba(10, 15, 26, 0.7)',
      backdropFilter: 'blur(16px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.25rem',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} color="#3b82f6" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em', color: '#f8fafc' }}>
            3+1 LangGraph Execution Flow Architecture
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> Active Node
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Corroborated
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Contradiction Block
          </span>
        </div>
      </div>

      <svg viewBox="0 0 880 230" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="edgeGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Directed Connections */}
        {/* Manager -> Evidence Inv */}
        <path
          d="M 140 110 C 240 110, 240 50, 340 50"
          fill="none"
          stroke={isExecuted('evidence_inv') ? '#06b6d4' : 'rgba(255, 255, 255, 0.12)'}
          strokeWidth={isExecuted('evidence_inv') ? 2.5 : 1.5}
          strokeDasharray={isActive('evidence_inv') ? '6 4' : undefined}
        />
        {/* Evidence Inv -> Manager */}
        <path
          d="M 340 50 C 270 50, 220 90, 155 105"
          fill="none"
          stroke={isExecuted('evidence_inv') ? 'rgba(6, 182, 212, 0.4)' : 'transparent'}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* Manager -> Context Inv */}
        <path
          d="M 140 110 C 240 110, 240 170, 340 170"
          fill="none"
          stroke={isExecuted('context_inv') ? '#06b6d4' : 'rgba(255, 255, 255, 0.12)'}
          strokeWidth={isExecuted('context_inv') ? 2.5 : 1.5}
          strokeDasharray={isActive('context_inv') ? '6 4' : undefined}
        />
        {/* Context Inv -> Manager */}
        <path
          d="M 340 170 C 270 170, 220 130, 155 115"
          fill="none"
          stroke={isExecuted('context_inv') ? 'rgba(6, 182, 212, 0.4)' : 'transparent'}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* Manager -> Critic */}
        <path
          d="M 140 110 C 300 110, 380 110, 540 110"
          fill="none"
          stroke={isExecuted('critic') ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)'}
          strokeWidth={isExecuted('critic') ? 2.5 : 1.5}
          strokeDasharray={isActive('critic') ? '6 4' : undefined}
        />

        {/* Critic -> Policy Engine */}
        <path
          d="M 540 110 L 740 110"
          fill="none"
          stroke={isExecuted('policy_eval') ? (terminalState === 'HOLD' ? '#ef4444' : '#10b981') : 'rgba(255, 255, 255, 0.12)'}
          strokeWidth={isExecuted('policy_eval') ? 3 : 1.5}
          strokeDasharray={isActive('policy_eval') ? '6 4' : undefined}
        />

        {/* Nodes */}
        {nodes.map((node) => {
          const executed = isExecuted(node.id)
          const active = isActive(node.id)
          const IconComp = node.icon

          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              {/* Outer pulsing ring if active */}
              {active && (
                <circle
                  r={32}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={2}
                  opacity={0.6}
                  style={{ animation: 'pulse-glow 1.5s infinite' }}
                />
              )}

              {/* Node base */}
              <circle
                r={24}
                fill={executed ? (active ? node.color : 'rgba(18, 26, 44, 0.95)') : 'rgba(15, 23, 42, 0.7)'}
                stroke={executed ? node.color : 'rgba(255, 255, 255, 0.2)'}
                strokeWidth={executed ? 2.5 : 1.5}
                filter={active || (node.id === 'policy_eval' && terminalState) ? 'url(#glow)' : undefined}
              />

              {/* Icon inside */}
              <foreignObject x={-12} y={-12} width={24} height={24}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <IconComp size={16} color={executed ? (active ? '#ffffff' : node.color) : '#64748b'} />
                </div>
              </foreignObject>

              {/* Labels */}
              <text
                y={38}
                textAnchor="middle"
                fill={executed ? '#f8fafc' : '#94a3b8'}
                fontSize="11.5"
                fontWeight="700"
                fontFamily="var(--font-sans)"
              >
                {node.title}
              </text>
              <text
                y={51}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
                fontWeight="500"
                fontFamily="var(--font-mono)"
              >
                {node.plane}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
