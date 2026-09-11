"use client";

import React from "react";
import { CaseDossier } from "../lib/types";
import {
  FileText,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Fingerprint,
  User,
  Building2,
  Lock,
} from "lucide-react";

interface CaseSidebarProps {
  cases: CaseDossier[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  isRunning: boolean;
  onRunInvestigation: () => void;
  hasRun: boolean;
  onOpenDataMinimization?: () => void;
}

export function CaseSidebar({
  cases,
  selectedCaseId,
  onSelectCase,
  isRunning,
  onRunInvestigation,
  hasRun,
  onOpenDataMinimization,
}: CaseSidebarProps) {
  const currentCase = cases.find((c) => c.case_id === selectedCaseId) || cases[0];

  return (
    <aside className="w-full lg:w-96 shrink-0 flex flex-col gap-4">
      {/* Case Selector Card */}
      <div className="glass-panel rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-trust-400" />
            Evaluation Test Cases
          </h2>
          <span className="text-[11px] font-mono text-trust-400 bg-trust-950/80 px-2 py-0.5 rounded border border-trust-800">
            Select Scenario
          </span>
        </div>

        {/* Case Selection Buttons */}
        <div className="space-y-2">
          {cases.map((c) => {
            const isSelected = c.case_id === selectedCaseId;
            const isCase2 = c.case_id === "CASE-002";

            return (
              <button
                key={c.case_id}
                onClick={() => onSelectCase(c.case_id)}
                disabled={isRunning}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  isSelected
                    ? isCase2
                      ? "bg-gradient-to-r from-crimson-950/60 to-slate-900 border-crimson-500/70 shadow-lg shadow-crimson-950/40"
                      : "bg-gradient-to-r from-trust-950/60 to-slate-900 border-trust-500/70 shadow-lg shadow-trust-950/40"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                } ${isRunning ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? isCase2
                          ? "bg-crimson-600 text-white"
                          : "bg-trust-600 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {c.case_id}
                  </span>
                  {isCase2 && (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Signature Override
                    </span>
                  )}
                  {c.case_id === "CASE-003" && (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Clean Corroborated
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm font-semibold text-slate-100 line-clamp-1">
                  {c.title.split(": ")[1] || c.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {c.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Investigation Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={onRunInvestigation}
            disabled={isRunning}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isRunning
                ? "bg-trust-700 text-white cursor-wait animate-pulse"
                : "bg-gradient-to-r from-trust-600 to-indigo-600 hover:from-trust-500 hover:to-indigo-500 text-white shadow-trust-600/30 hover:shadow-trust-500/40 active:scale-[0.99]"
            }`}
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Executing 3+1 LangGraph Planes...</span>
              </>
            ) : hasRun ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Re-run Investigation</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Multi-Agent Investigation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Case Dossier Card */}
      <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-trust-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Database Dossier: <span className="text-trust-400 font-mono">{currentCase.case_id}</span>
            </h3>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Pre-LLM Grounding
          </span>
        </div>

        {/* Dossier Metadata Grid */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-slate-400 font-medium">Demographics</div>
              <div className="text-slate-100 font-semibold mt-0.5">
                Age {currentCase.age} • Origin: {currentCase.origin}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-slate-400 font-medium">Reported Timeline</div>
              <div className="text-slate-200 mt-0.5 font-mono text-[11px] leading-relaxed">
                {currentCase.timeline}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-slate-400 font-medium">Registered Civic / Transit Hub</div>
              <div className="text-slate-200 mt-0.5 font-medium leading-relaxed">
                {currentCase.registered_hub}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-slate-400 font-medium">Ground-Truth Physical Markers</div>
              <div className="text-slate-100 mt-0.5 font-medium bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[11px]">
                {currentCase.physical_markers}
              </div>
            </div>
          </div>
        </div>

        {/* Raw Intake Summary */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Raw Incident Intake
          </div>
          <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
            {currentCase.raw_intake}
          </p>
        </div>

        {/* FastMCP Quarantine Notice Box */}
        <div className="pt-2">
          <div
            onClick={onOpenDataMinimization}
            className="cursor-pointer bg-slate-900/90 border border-slate-800 hover:border-trust-500/40 p-3 rounded-xl transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-trust-400" />
                Data Minimization Gate
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
                0 Leaks
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
              Protected fields (<code className="text-amber-300">address</code>, <code className="text-amber-300">biometrics</code>, <code className="text-amber-300">phone</code>) quarantined from token contexts.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
