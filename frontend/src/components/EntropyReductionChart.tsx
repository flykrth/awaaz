"use client";

import React from "react";
import { TrendingDown, Info, Activity } from "lucide-react";

interface EntropyReductionChartProps {
  entropyHistory: number[];
  terminalState?: string;
}

export function EntropyReductionChart({
  entropyHistory,
  terminalState,
}: EntropyReductionChartProps) {
  const data = entropyHistory.length > 0 ? entropyHistory : [1.0];
  const initialH = data[0];
  const finalH = data[data.length - 1];
  const delta = initialH - finalH;

  // Chart dimensions
  const width = 360;
  const height = 120;
  const padding = 20;

  // Generate SVG points
  const points = data
    .map((val, idx) => {
      const x = padding + (idx / Math.max(data.length - 1, 1)) * (width - 2 * padding);
      const y = padding + (1 - val) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  const isHold = terminalState === "HOLD";

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-trust-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Uncertainty Entropy Reduction Curve
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          Metric: H(S) ∈ [0, 1]
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] font-medium text-slate-400">Initial H</div>
          <div className="text-lg font-mono font-bold text-slate-200 mt-0.5">
            {initialH.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500">Uncorroborated</div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] font-medium text-slate-400">Final H</div>
          <div
            className={`text-lg font-mono font-bold mt-0.5 ${
              isHold
                ? "text-crimson-400"
                : finalH === 0
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {finalH.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500">
            {isHold ? "Halted (Hold)" : finalH === 0 ? "Resolved" : "Pending"}
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] font-medium text-slate-400">Reduction Δ</div>
          <div className="text-lg font-mono font-bold text-trust-400 mt-0.5 flex items-center justify-center gap-1">
            <TrendingDown className="w-4 h-4 text-trust-400" />
            {delta > 0 ? `-${delta.toFixed(2)}` : "0.00"}
          </div>
          <div className="text-[10px] text-slate-500">Evidence Grounding</div>
        </div>
      </div>

      {/* SVG Curve Display */}
      <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800/80 relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          {/* Horizontal Reference Lines */}
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="#1E293B"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#1E293B"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Sparkline Path */}
          <polyline
            fill="none"
            stroke={isHold ? "#EF4444" : "#3B82F6"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Sparkline Points */}
          {data.map((val, idx) => {
            const cx = padding + (idx / Math.max(data.length - 1, 1)) * (width - 2 * padding);
            const cy = padding + (1 - val) * (height - 2 * padding);
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="4"
                className={isHold ? "fill-crimson-500" : "fill-trust-400"}
                stroke="#090D16"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1 pt-1">
          <span>Intake (H=1.00)</span>
          <span>Investigators</span>
          <span>Critic</span>
          <span>Policy (+1)</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-snug">
        Monotonic uncertainty reduction metric formulated in{" "}
        <code className="text-trust-300 font-mono">src/state.py</code>, measuring evidence convergence as agents corroborate disparate municipal data streams.
      </p>
    </div>
  );
}
