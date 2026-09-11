"use client";

import React, { useState, useEffect } from "react";
import { Key, Shield, CheckCircle2, X, AlertCircle, Zap, Cpu } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
}: ApiKeyModalProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setInputKey("");
    onSaveKey("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B1220] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-trust-600/20 border border-trust-500/40 flex items-center justify-center text-trust-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Gemini API Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Configure Google GenAI Gemini 2.5 Flash credentials for live agent reasoning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-trust-400" />
                Dual-Mode Execution Architecture:
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                Sovereign Fallback Active
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              If no API key is specified, the system automatically runs in <strong>Sovereign Mode</strong> with 100% deterministic, offline knowledge grounding. Providing your key unlocks live dynamic Gemini 2.5 Flash inference.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Google Gemini API Key:
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-trust-500 transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Key is stored locally in your browser session and sent to the secure chat route.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Credentials saved. Switching to Live Gemini 2.5 Mode.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 text-xs transition-colors"
          >
            Clear Key (Revert to Sovereign)
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-trust-600 to-indigo-600 hover:from-trust-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-trust-600/30"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
