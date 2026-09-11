"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Zap,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { probeFastMCPField, ProbeResult } from "../lib/api";
import { QUARANTINE_SPEC } from "../lib/mockData";

interface DataMinimizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataMinimizationDrawer({
  isOpen,
  onClose,
}: DataMinimizationDrawerProps) {
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);
  const [probingField, setProbingField] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleProbe = async (field: string) => {
    setIsSimulating(true);
    setProbingField(field);
    setProbeResult(null);

    try {
      const res = await probeFastMCPField(field);
      setProbeResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0D1424] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-trust-600/20 border border-trust-500/40 flex items-center justify-center text-trust-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  FastMCP Data Minimization &amp; Quarantine Gate
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  0 Sensitive Fields Exposed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enforcing strict pre-LLM schema quarantine. Minor PII never enters model token contexts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Security Guarantee Banner */}
          <div className="bg-gradient-to-r from-trust-950/60 to-slate-900 border border-trust-500/30 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">
                Architecture Guarantee (Track 03 / Track 04):
              </strong>{" "}
              In missing-child recovery, exposing residential addresses or biometric vectors to LLMs creates severe privacy and exploitation hazards. Project Awaaz places an immutable schema quarantine gate inside{" "}
              <code className="text-trust-300 font-mono">MockCaseDB.query_metadata()</code> and FastMCP tools, rejecting unauthorized queries with deterministic exceptions.
            </div>
          </div>

          {/* Quarantined Fields vs Allowed Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quarantined / Blocked */}
            <div className="bg-slate-950/70 border border-crimson-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-crimson-400 flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4" />
                  Quarantined Sensitive Fields
                </div>
                <span className="text-[10px] font-mono bg-crimson-950 text-crimson-300 px-2 py-0.5 rounded border border-crimson-800 font-bold">
                  BLOCKED
                </span>
              </div>

              <div className="space-y-2">
                {QUARANTINE_SPEC.quarantined_fields.map((item) => (
                  <div
                    key={item.field}
                    className="p-2.5 rounded-lg bg-crimson-950/20 border border-crimson-900/50 text-xs"
                  >
                    <div className="font-mono font-bold text-crimson-300 flex items-center justify-between">
                      <code>{item.field}</code>
                      <span className="text-[10px] font-mono text-crimson-400">[PROTECTED]</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-normal">
                      {item.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permitted Safe Fields */}
            <div className="bg-slate-950/70 border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Permitted Safe Metadata
                </div>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                  ALLOWED
                </span>
              </div>

              <div className="space-y-2">
                {QUARANTINE_SPEC.allowed_fields.map((item) => (
                  <div
                    key={item.field}
                    className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-xs"
                  >
                    <div className="font-mono font-bold text-emerald-300 flex items-center justify-between">
                      <code>{item.field}</code>
                      <span className="text-[10px] font-mono text-emerald-400">[SAFE]</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-normal">
                      {item.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Probe Simulator */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-trust-400" />
                  Live FastMCP Quarantine Probe Simulator
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click a field to test how the FastMCP Gate handles agent requests in real time:
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Interactive Test
              </span>
            </div>

            {/* Test Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleProbe("exact_address")}
                disabled={isSimulating}
                className="px-3 py-2 rounded-lg bg-crimson-950/60 hover:bg-crimson-900/80 border border-crimson-500/50 text-xs font-mono text-crimson-200 transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-crimson-400" />
                Probe: exact_address
              </button>
              <button
                onClick={() => handleProbe("biometric_hash")}
                disabled={isSimulating}
                className="px-3 py-2 rounded-lg bg-crimson-950/60 hover:bg-crimson-900/80 border border-crimson-500/50 text-xs font-mono text-crimson-200 transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-crimson-400" />
                Probe: biometric_hash
              </button>
              <button
                onClick={() => handleProbe("contact_number")}
                disabled={isSimulating}
                className="px-3 py-2 rounded-lg bg-crimson-950/60 hover:bg-crimson-900/80 border border-crimson-500/50 text-xs font-mono text-crimson-200 transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-crimson-400" />
                Probe: contact_number
              </button>
              <button
                onClick={() => handleProbe("physical_markers")}
                disabled={isSimulating}
                className="px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-xs font-mono text-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Probe: physical_markers (Safe)
              </button>
            </div>

            {/* Probe Response Output Box */}
            {isSimulating && (
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 animate-pulse flex items-center gap-2">
                <Terminal className="w-4 h-4 animate-spin text-trust-400" />
                Dispatching probe to FastMCP Tool Server...
              </div>
            )}

            {probeResult && !isSimulating && (
              <div
                className={`p-4 rounded-xl border text-xs font-mono transition-all ${
                  probeResult.status === "BLOCKED"
                    ? "bg-crimson-950/60 border-crimson-500 text-crimson-200 shadow-lg shadow-crimson-950/50"
                    : "bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/50"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-current/20 mb-2">
                  <span className="font-bold flex items-center gap-1.5">
                    {probeResult.status === "BLOCKED" ? (
                      <AlertTriangle className="w-4 h-4 text-crimson-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    FastMCP Decision: {probeResult.status}
                  </span>
                  <span className="text-[10px] opacity-80">
                    Field: {probeResult.field}
                  </span>
                </div>

                {probeResult.exception && (
                  <div className="text-crimson-300 font-bold mb-1">
                    {probeResult.exception}
                  </div>
                )}

                {probeResult.response && (
                  <div className="text-emerald-200 font-bold mb-1">
                    Allowed Response: {JSON.stringify(probeResult.response)}
                  </div>
                )}

                <div className="text-[11px] opacity-90 mt-1 font-sans">
                  {probeResult.governanceMessage}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            FastMCP Protocol: <span className="text-trust-400 font-semibold">In-Process + stdio / SSE</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
