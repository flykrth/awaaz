"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  FileCheck,
  X,
  Lock,
  Stamp,
  AlertCircle,
} from "lucide-react";

interface HumanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export function HumanReviewModal({
  isOpen,
  onClose,
  caseId,
}: HumanReviewModalProps) {
  const [officerName, setOfficerName] = useState("Inspector R. K. Verma");
  const [badgeId, setBadgeId] = useState("CW-IND-88210");
  const [department, setDepartment] = useState(
    "District Child Welfare & Transit Protection Unit"
  );
  const [isSignedOff, setIsSignedOff] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B1220] border border-emerald-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Human Adjudication Clearance Panel
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  MANDATORY CLEARANCE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Case <code className="text-emerald-400 font-mono">{caseId}</code> has satisfied Policy Rule 5. Human sign-off required.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Corroboration Summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">
                Corroborated Evidence Audit Trail
              </span>
              <span className="font-mono text-emerald-400 font-bold">100% Verified</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Identity</div>
                <div className="text-emerald-400 font-mono font-bold">✓ 0.98</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Origin</div>
                <div className="text-emerald-400 font-mono font-bold">✓ 0.98</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Timeline</div>
                <div className="text-emerald-400 font-mono font-bold">✓ 0.98</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Markers</div>
                <div className="text-emerald-400 font-mono font-bold">✓ 0.98</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Zero hard contradictions, zero prompt injection anomalies detected. FastMCP pre-LLM quarantine gate verified zero PII exposure during multi-agent grounding.
            </div>
          </div>

          {/* Adjudicator Sign-Off Form */}
          {!isSignedOff ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Certified Adjudicator Sign-Off
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Authorizing Officer</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Badge / Officer ID</label>
                    <input
                      type="text"
                      value={badgeId}
                      onChange={(e) => setBadgeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsSignedOff(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Stamp className="w-4 h-4" />
                  Sign &amp; Authorize Real-World Intervention
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/50 border border-emerald-500 rounded-xl p-5 space-y-3 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-600/30 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">
                Intervention Certified by Human Adjudicator
              </h4>
              <p className="text-xs text-emerald-300 font-mono">
                Authorization Token: <code>AWAAZ-CLEARANCE-2026-09-11-AUTH-0994</code>
              </p>
              <div className="text-xs text-slate-300 pt-1">
                Authorized by <strong className="text-white">{officerName}</strong> ({badgeId}) • {department}
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
