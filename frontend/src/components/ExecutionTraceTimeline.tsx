"use client";

import React, { useState } from "react";
import { LangGraphStep, TerminalState } from "../lib/types";
import {
  Compass,
  Search,
  Clock,
  Scale,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Activity,
  ArrowRight,
  Database,
  Cpu,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExecutionTraceTimelineProps {
  steps: LangGraphStep[];
  currentStepIndex: number;
  onSelectStep?: (index: number) => void;
  terminalState?: TerminalState;
  policyRuleTriggered?: string;
}

export function ExecutionTraceTimeline({
  steps,
  currentStepIndex,
  onSelectStep,
  terminalState,
  policyRuleTriggered,
}: ExecutionTraceTimelineProps) {
  const visibleSteps = steps.slice(0, currentStepIndex + 1);

  const getPlaneColor = (plane: string) => {
    if (plane.includes("Plane 1")) return "border-blue-500/50 bg-blue-950/20 text-blue-400";
    if (plane.includes("Plane 2")) return "border-cyan-500/50 bg-cyan-950/20 text-cyan-400";
    if (plane.includes("Plane 3")) return "border-amber-500/50 bg-amber-950/20 text-amber-400";
    return "border-emerald-500/50 bg-emerald-950/20 text-emerald-400";
  };

  const getToolTypeBadge = (toolType: string) => {
    switch (toolType) {
      case "FastMCP":
        return "bg-cyan-950 text-cyan-300 border-cyan-800";
      case "ChromaDB RAG":
        return "bg-indigo-950 text-indigo-300 border-indigo-800";
      case "Dual-Mode LLM":
        return "bg-purple-950 text-purple-300 border-purple-800";
      case "Deterministic Policy":
        return "bg-emerald-950 text-emerald-300 border-emerald-800";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-trust-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Live Execution Trace: The 3+1 LangGraph Planes
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-agent reasoning chain, tool dispatches, and deterministic governance audits
          </p>
        </div>

        {/* Planes Indicator Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            Plane 1: Manager
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            Plane 2: FastMCP RAG
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            Plane 3: Critic
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            +1: Policy Engine
          </span>
        </div>
      </div>

      {/* Steps Timeline Track */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-trust-500 before:via-cyan-500 before:to-emerald-500">
        <AnimatePresence initial={false}>
          {visibleSteps.map((s, idx) => {
            const isLast = idx === visibleSteps.length - 1;
            const isHold = s.terminal_state === "HOLD";
            const isAuthorized = s.terminal_state === "HUMAN_REVIEW_REQUIRED";

            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="relative group"
              >
                {/* Node Icon on Timeline Line */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border ${
                    isHold
                      ? "bg-crimson-600 border-crimson-400 text-white animate-pulse"
                      : isAuthorized
                      ? "bg-emerald-600 border-emerald-400 text-white"
                      : "bg-slate-900 border-trust-500/60 text-trust-300"
                  }`}
                >
                  {s.step}
                </div>

                {/* Step Card */}
                <div
                  className={`rounded-xl p-4 sm:p-5 border transition-all ${
                    isHold
                      ? "bg-crimson-950/30 border-crimson-500/50 shadow-md shadow-crimson-950/40"
                      : isAuthorized
                      ? "bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/40"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Step Meta Info Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{s.icon}</span>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {s.title}
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${getPlaneColor(
                            s.plane
                          )}`}
                        >
                          {s.plane.split(":")[0]}
                        </span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getToolTypeBadge(
                          s.toolType
                        )}`}
                      >
                        {s.toolType}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                        {s.timestamp.split(" ")[1]}
                      </span>
                    </div>
                  </div>

                  {/* Tool Dispatch Command Box */}
                  <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800/80 mb-3 flex items-start gap-2 text-xs font-mono">
                    <Terminal className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div className="flex-1 overflow-x-auto text-trust-300">
                      <code>{s.tool}</code>
                    </div>
                  </div>

                  {/* Reasoning Trace Snippet */}
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                      Reasoning Snippet:
                    </div>
                    <p className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 font-sans text-slate-200">
                      {s.reasoning}
                    </p>
                  </div>

                  {/* Dimension Updates if Available */}
                  {s.uncertainty_budget && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-400">
                        Updated Dimensions:
                      </span>
                      {Object.entries(s.uncertainty_budget).map(([dim, val]) => (
                        <span
                          key={dim}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            val.status === "CONFIRMED"
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                              : val.status === "CONTRADICTED"
                              ? "bg-crimson-950/80 text-crimson-300 border-crimson-700"
                              : "bg-amber-950/60 text-amber-400 border-amber-800"
                          }`}
                        >
                          {dim}: {val.status} ({val.confidence.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contradiction Warning inside Critic Step */}
                  {s.contradictions && s.contradictions.length > 0 && (
                    <div className="mt-3 bg-crimson-950/70 border border-crimson-500/60 rounded-lg p-3 text-xs text-crimson-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-crimson-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-white">
                          Adversarial Audit Alert:
                        </strong>{" "}
                        {s.contradictions[0].reason}
                      </div>
                    </div>
                  )}

                  {/* Terminal Decision Badge on Last Node */}
                  {s.terminal_state && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                      <span className="text-slate-400">Terminal State Decision:</span>
                      <span
                        className={`px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider border ${
                          s.terminal_state === "HOLD"
                            ? "bg-crimson-600 text-white border-crimson-400 shadow-md shadow-crimson-950"
                            : s.terminal_state === "HUMAN_REVIEW_REQUIRED"
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950"
                            : "bg-trust-600 text-white border-trust-400"
                        }`}
                      >
                        {s.terminal_state}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
