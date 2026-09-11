"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldAlert,
  Server,
  Cpu,
  CheckCircle2,
  Lock,
  ExternalLink,
  Zap,
} from "lucide-react";

interface NavbarProps {
  engineMode: "sovereign" | "gemini";
  setEngineMode: (mode: "sovereign" | "gemini") => void;
  onOpenDataMinimization?: () => void;
}

export function Navbar({
  engineMode,
  setEngineMode,
  onOpenDataMinimization,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#080D1A]/90 backdrop-blur-md">
      {/* Strict Governance Rule Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-b border-amber-500/30 px-4 py-1.5 text-center text-xs font-medium text-amber-200 flex items-center justify-center gap-2 shadow-inner">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <span>
          <strong className="font-semibold uppercase tracking-wider text-amber-300">
            Strict Governance Directive:
          </strong>{" "}
          The AI cannot authorize interventions. Human review is mandatory. All
          real-world civic actions require certified officer sign-off.
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-trust-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-trust-600/30 border border-trust-400/40">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                Awaaz
                <span className="text-xs font-normal text-slate-400">|</span>
                <span className="text-sm font-medium text-slate-300">
                  Evidence-Grounded Case Resolution
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-trust-950 text-trust-300 border border-trust-600/40">
                Track 03: Trustworthy AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Deterministic 3+1 LangGraph Multi-Agent Governance & FastMCP Privacy Gate
            </p>
          </div>
        </div>

        {/* Live System Badges & Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* FastMCP Status Badge */}
          <button
            onClick={onOpenDataMinimization}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-trust-500/50 transition-colors text-xs text-slate-300 group"
            title="Click to inspect FastMCP Data Minimization & Quarantine Gate"
          >
            <Lock className="w-3.5 h-3.5 text-trust-400 group-hover:text-trust-300" />
            <span>FastMCP:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Connected (stdio)
            </span>
          </button>

          {/* System Health Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">System:</span>
            <span className="text-emerald-400 font-medium">Healthy (12ms)</span>
          </div>

          {/* Engine Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setEngineMode("sovereign")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                engineMode === "sovereign"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Deterministic 100% offline sovereign embedding & offline LLM fallback"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sovereign Mode</span>
              <span className="sm:hidden">Sovereign</span>
            </button>
            <button
              onClick={() => setEngineMode("gemini")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                engineMode === "gemini"
                  ? "bg-gradient-to-r from-trust-600 to-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Gemini 2.5 Live LLM Gateway with deterministic policy post-audit"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Gemini</span>
              <span className="sm:hidden">Live</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
