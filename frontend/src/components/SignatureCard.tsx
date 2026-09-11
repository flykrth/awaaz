"use client";

import React from "react";
import {
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Fingerprint,
  Scale,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface SignatureCardProps {
  similarityScore?: number;
  facialScore?: number;
  contradictionReason?: string;
}

export function SignatureCard({
  similarityScore = 0.94,
  facialScore = 0.984,
  contradictionReason = "Physical marker contradiction detected: left forearm != right forearm",
}: SignatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="signature-card-blocked rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-2xl"
    >
      {/* Background cyber/hazard grid accent */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-crimson-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-crimson-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-crimson-600/20 border border-crimson-500/50 flex items-center justify-center text-crimson-400">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold tracking-widest text-crimson-400 uppercase">
              Deterministic Governance Engine • Rule 1 Enforced
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              The Signature Contradiction Override Theorem
            </h3>
          </div>
        </div>

        {/* Theorem Formula Pill */}
        <div className="px-3.5 py-1.5 rounded-lg bg-crimson-950/80 border border-crimson-500 text-xs font-mono font-black tracking-wider text-crimson-200 shadow-md">
          HARD CONTRADICTION &gt; SIMILARITY
        </div>
      </div>

      {/* Main Content Grid: Similarity Dial & Dimension Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
        {/* Left: Prominent Similarity Metric Gauge */}
        <div className="md:col-span-4 bg-slate-950/70 border border-crimson-500/30 rounded-xl p-5 text-center flex flex-col items-center justify-center relative shadow-inner">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Biometric Similarity Score
          </div>

          <div className="relative my-2 flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg className="w-28 h-28 -rotate-90 transform">
              <circle
                cx="56"
                cy="56"
                r="46"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="46"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={289}
                strokeDashoffset={289 * (1 - similarityScore)}
                strokeLinecap="round"
                className="text-amber-500 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white tracking-tight">
                {(similarityScore * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                High Match
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-1">
            Facial candidate confidence:{" "}
            <span className="text-amber-300 font-mono font-bold">
              {(facialScore * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right: Dimension Breakdown Grid */}
        <div className="md:col-span-8 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Multi-Source Dimension Breakdown</span>
            <span className="text-[11px] font-mono text-slate-500">
              Confidence / Status
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Age Dimension */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400">Age Dimension</div>
                <div className="text-sm font-semibold text-slate-200">16 Years</div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>0.91</span>
              </div>
            </div>

            {/* Origin Dimension */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400">Origin Dimension</div>
                <div className="text-sm font-semibold text-slate-200">Ranchi / ISBT</div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>0.87</span>
              </div>
            </div>

            {/* Timeline Dimension */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400">Timeline Dimension</div>
                <div className="text-sm font-semibold text-slate-200">2026-09-03 14:00</div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>0.93</span>
              </div>
            </div>

            {/* Physical Marker Dimension - HARD CONTRADICTION */}
            <div className="bg-crimson-950/50 border border-crimson-500/60 rounded-lg p-3 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold text-crimson-300 flex items-center gap-1">
                  <span>Physical Marker</span>
                </div>
                <div className="text-xs text-crimson-200 line-clamp-1 font-mono mt-0.5">
                  Scar: Left vs Right
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-crimson-600 text-white text-xs font-mono font-black tracking-wider shadow-sm animate-pulse">
                <XCircle className="w-3.5 h-3.5" />
                <span>HARD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Striking Alert Box Specified by User */}
      <div className="mt-6 bg-crimson-950/90 border-2 border-crimson-600 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-crimson-600 flex items-center justify-center shrink-0 shadow-lg text-white">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="text-base sm:text-lg font-black tracking-wide text-white flex items-center gap-2">
              <span>ESCALATION BLOCKED</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-crimson-200">
              Physical marker contradiction detected. Policy:{" "}
              <span className="underline decoration-crimson-400 decoration-2 underline-offset-2">
                HARD CONTRADICTION &gt; SIMILARITY
              </span>
              . Final State: <span className="font-mono text-white font-bold bg-crimson-900/80 px-2 py-0.5 rounded border border-crimson-500">HOLD</span>.
            </p>
            <div className="text-xs text-crimson-300/90 pt-1 font-mono leading-relaxed">
              Conflict detail: {contradictionReason}
            </div>
          </div>
        </div>
      </div>

      {/* Governance Rationale Comparison */}
      <div className="mt-4 pt-4 border-t border-crimson-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
          <div className="font-semibold text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Unconstrained AI / Naive Agents:
          </div>
          <p className="text-slate-400 mt-1 leading-relaxed">
            Would output high-confidence false positive based on 94% similarity / 98.4% facial match, wrongfully deploying municipal alerts.
          </p>
        </div>

        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
          <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Project Awaaz Deterministic Policy:
          </div>
          <p className="text-slate-300 mt-1 leading-relaxed">
            Zero-LLM Rule 1 strictly halts automated escalation on physical discrepancies, preventing traumatic misidentifications.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
