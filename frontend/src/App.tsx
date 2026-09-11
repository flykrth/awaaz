import React, { useState, useEffect } from 'react'
import {
  Shield,
  Activity,
  Play,
  FileText,
  Lock,
  FlaskConical,
  BookOpen,
  Database,
} from 'lucide-react'

import type { CaseOption, InvestigateResponse } from './types'
import { apiUrl } from './api'
import { GraphVisualizer } from './components/GraphVisualizer'
import { UncertaintyBudgetView } from './components/UncertaintyBudgetView'
import { OutcomeCard } from './components/OutcomeCard'
import { RagExplorer } from './components/RagExplorer'
import { JudgePlayground } from './components/JudgePlayground'
import { PolicyRulesReference } from './components/PolicyRulesReference'

export const App: React.FC = () => {
  const [cases, setCases] = useState<CaseOption[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-001')
  const [activeTab, setActiveTab] = useState<'audit' | 'playground' | 'rag' | 'rules'>('audit')

  // LLM Mode
  const [engineMode, setEngineMode] = useState<string>('sovereign')

  // Investigation Execution State
  const [loading, setLoading] = useState<boolean>(false)
  const [investigation, setInvestigation] = useState<InvestigateResponse | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null)

  // Fetch initial cases & mode
  useEffect(() => {
    fetch(apiUrl('/api/cases'))
      .then((res) => res.json())
      .then((data) => {
        if (data.cases) {
          setCases(data.cases)
        }
      })
      .catch((err) => console.error('Failed to load cases:', err))

    fetch(apiUrl('/api/mode'))
      .then((res) => res.json())
      .then((data) => {
        setEngineMode(data.mode)
      })
      .catch((err) => console.error('Failed to load mode:', err))
  }, [])

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0]

  const handleToggleMode = async (newMode: string) => {
    try {
      const res = await fetch(apiUrl('/api/mode'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      })
      const data = await res.json()
      setEngineMode(data.mode)
    } catch (err) {
      console.error('Mode toggle failed:', err)
    }
  }

  const handleRunInvestigation = async () => {
    if (!selectedCase) return
    setLoading(true)
    setInvestigation(null)
    setActiveStepIndex(null)

    try {
      const res = await fetch(apiUrl('/api/investigate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_selection: selectedCase.label }),
      })
      const data: InvestigateResponse = await res.json()
      setInvestigation(data)

      // Step-by-step playback simulation on graph
      if (data.steps && data.steps.length > 0) {
        let i = 0
        const interval = setInterval(() => {
          if (i < data.steps.length) {
            setActiveStepIndex(i)
            i++
          } else {
            clearInterval(interval)
          }
        }, 500)
      }
    } catch (err) {
      console.error('Investigation execution failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentActiveNode =
    investigation?.steps && activeStepIndex !== null && activeStepIndex < investigation.steps.length
      ? investigation.steps[activeStepIndex].node
      : null

  const executedNodes = investigation?.steps ? investigation.steps.map((s) => s.node) : []

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top App Header */}
      <header className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', padding: '0.45rem', borderRadius: '10px', display: 'flex' }}>
              <Shield size={24} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Project Awaaz | Command Center
              </h1>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Evidence-Grounded Multi-Agent Case Resolution &bull; ChromaDB Vector RAG &bull; Zero-Harm Deterministic Policy Engine
              </p>
            </div>
          </div>
        </div>

        {/* Header Controls & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Track Badge */}
          <div className="track-pill">
            <span className="track-dot" />
            Track 04: Smart Infrastructure &amp; AI
          </div>

          {/* Engine Mode Toggle */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(10, 15, 26, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            padding: '0.2rem',
            alignItems: 'center',
          }}>
            <button
              onClick={() => handleToggleMode('sovereign')}
              style={{
                background: engineMode === 'sovereign' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
                color: engineMode === 'sovereign' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🟢 Sovereign Offline Mode
            </button>
            <button
              onClick={() => handleToggleMode('gemini')}
              style={{
                background: engineMode === 'gemini' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'transparent',
                color: engineMode === 'gemini' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🔵 Gemini 2.5 Mode
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'audit', label: '🏛️ Canonical Case Audit', icon: Activity },
          { id: 'playground', label: '🧪 Judge Playground', icon: FlaskConical },
          { id: 'rag', label: '🔎 ChromaDB Vector RAG', icon: Database },
          { id: 'rules', label: '🛡️ Governance & Rules 1-5', icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
              border: activeTab === tab.id ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
              borderRadius: '10px',
              padding: '0.55rem 1.15rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'audit' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Case Selector & Dossier */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Select Benchmark Case
              </label>
              <select
                value={selectedCaseId}
                onChange={(e) => {
                  setSelectedCaseId(e.target.value)
                  setInvestigation(null)
                  setActiveStepIndex(null)
                }}
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Case Intake Summary */}
              {selectedCase && (
                <div style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Raw Intake Narrative
                  </span>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem', lineHeight: 1.45 }}>
                    {selectedCase.raw_intake}
                  </p>
                </div>
              )}

              {/* Execute Button */}
              <button
                className="btn-primary"
                onClick={handleRunInvestigation}
                disabled={loading}
                style={{ width: '100%', marginTop: '1.25rem' }}
              >
                <Play size={16} />
                {loading ? 'Analyzing Case with 3+1 Agents...' : 'Run Investigation Workflow'}
              </button>
            </div>

            {/* Database Dossier */}
            {selectedCase && (
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <FileText size={17} color="#38bdf8" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                    Official Dossier: {selectedCase.id}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Origin:</span>
                    <strong style={{ color: '#f8fafc' }}>{selectedCase.dossier.origin || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Age:</span>
                    <strong style={{ color: '#f8fafc' }}>{selectedCase.dossier.age || 'N/A'}</strong>
                  </div>
                  <div style={{ color: '#94a3b8' }}>
                    <span>Timeline:</span>
                    <p style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>{selectedCase.dossier.timeline || 'N/A'}</p>
                  </div>
                  <div style={{ color: '#94a3b8' }}>
                    <span>Physical Markers:</span>
                    <p style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>{selectedCase.dossier.physical_markers || 'N/A'}</p>
                  </div>
                </div>

                {/* Data Minimization Quarantine Indicator */}
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <Lock size={13} />
                    Data Minimization Quarantine Active
                  </div>
                  <p style={{ fontSize: '0.73rem', color: '#e9d5ff', lineHeight: 1.4 }}>
                    Minor coordinates, phone numbers, and biometric hashes are sequestered at the FastMCP tool gateway before agent exposure.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Visualizer, Uncertainty Budget & Outcome */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Interactive Graph Visualizer */}
            <GraphVisualizer
              activeNode={currentActiveNode}
              executedNodes={executedNodes}
              terminalState={investigation?.terminal_state}
            />

            {/* Signature Outcome Card */}
            {investigation && (
              <OutcomeCard
                decision={investigation.terminal_state}
                explanation={investigation.explanation}
                contradictions={investigation.contradictions}
              />
            )}

            {/* Uncertainty Budget */}
            <UncertaintyBudgetView
              budget={investigation ? investigation.uncertainty_budget : (selectedCase?.initial_budget || {})}
              title={investigation ? 'Final Corroborated Uncertainty Budget' : 'Initial Case Uncertainty Budget'}
            />

            {/* Step-by-Step History Log */}
            {investigation && investigation.steps.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
                  Execution Step-by-Step Observability Trace ({investigation.steps.length} Steps)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {investigation.steps.map((step) => (
                    <div
                      key={step.step}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        padding: '0.85rem 1.1rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            background: '#2563eb',
                            color: '#ffffff',
                            borderRadius: '4px',
                            padding: '0.15rem 0.45rem',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                          }}>
                            STEP {step.step}
                          </span>
                          <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{step.title}</strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                          {step.tool}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                        {step.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Judge Playground */}
      {activeTab === 'playground' && <JudgePlayground />}

      {/* Tab 3: ChromaDB Vector RAG Explorer */}
      {activeTab === 'rag' && <RagExplorer />}

      {/* Tab 4: Governance & Rules Reference */}
      {activeTab === 'rules' && <PolicyRulesReference />}
    </div>
  )
}

export default App
