"use client";

import React, { useState } from "react";
import { MOCK_RAG_SOURCES } from "../lib/mockData";
import {
  Database,
  Camera,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  Tag,
  Cpu,
} from "lucide-react";

export function EvidenceInspector() {
  const [selectedSourceId, setSelectedSourceId] = useState<string>("RAG-01");
  const currentSource =
    MOCK_RAG_SOURCES.find((s) => s.id === selectedSourceId) || MOCK_RAG_SOURCES[0];

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-trust-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              ChromaDB Hybrid Vector RAG Evidence Inspector
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Connected Municipal Infrastructure Corpus with Dense Neural + Sovereign Hash Projection
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-trust-300 bg-trust-950/80 px-2.5 py-1 rounded-lg border border-trust-800">
          <Cpu className="w-3.5 h-3.5" />
          <span>Metric: Cosine Space (hnsw:space: cosine)</span>
        </div>
      </div>

      {/* Sources Grid & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Selector List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Ingested Municipal Sources
          </div>

          <div className="space-y-2">
            {MOCK_RAG_SOURCES.map((source) => {
              const isSelected = source.id === selectedSourceId;

              return (
                <button
                  key={source.id}
                  onClick={() => setSelectedSourceId(source.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-trust-950/70 border-trust-500 text-white shadow-md shadow-trust-950/40"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-trust-400">
                      {source.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-semibold">
                      {(source.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 mt-1.5 line-clamp-1">
                    {source.source_name}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{source.location}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Evidence Detail Box */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-mono text-trust-400 uppercase tracking-wider">
                Source Document
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {currentSource.source_name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Checkpoint Coverage</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {currentSource.checkpoint_coverage}
              </span>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Facility Node:</span>
              <span className="text-slate-200 font-medium">{currentSource.facility}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Handoff Latency:</span>
              <span className="text-slate-200 font-medium font-mono">
                {currentSource.handoff_latency}
              </span>
            </div>
          </div>

          {/* Extracted Evidence Chunk */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-trust-400" />
              Retrieved Evidence Vector Chunk:
            </div>
            <div className="bg-slate-900/90 border-l-4 border-trust-500 p-3.5 rounded-r-lg text-xs font-mono text-slate-200 leading-relaxed">
              "{currentSource.snippet}"
            </div>
          </div>

          {/* Source Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            {currentSource.metadata_tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
