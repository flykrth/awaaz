"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Shield,
  Layers,
  Terminal,
  Activity,
  RotateCcw,
  Key,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Cpu,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage, parseMessageActions, sendChatMessage } from "../lib/chatApi";
import { SignatureCard } from "./SignatureCard";
import { ExecutionTraceTimeline } from "./ExecutionTraceTimeline";
import { EntropyReductionChart } from "./EntropyReductionChart";
import { probeFastMCPField, ProbeResult } from "../lib/api";
import { MOCK_RESULTS } from "../lib/mockData";

interface ChatbotInterfaceProps {
  apiKey: string;
  onOpenApiKeyModal: () => void;
  onNavigateToTab?: (tab: "investigation" | "rag" | "civic") => void;
  onOpenHumanReview?: (caseId: string) => void;
}

const SUGGESTED_PROMPTS = [
  {
    title: "Signature Contradiction Override",
    subtitle: "Demonstrate Rule 1 override in CASE-002",
    prompt: "How does the Signature Contradiction Override work? Demo CASE-002",
    tag: "Rule 1",
  },
  {
    title: "Investigate CASE-001",
    subtitle: "Route missing timeline through Context Investigator",
    prompt: "Run an investigation on CASE-001 (Missing Timeline)",
    tag: "Plane 2",
  },
  {
    title: "FastMCP Data Minimization",
    subtitle: "Test pre-LLM quarantine schema gate",
    prompt: "Test the FastMCP Pre-LLM Data Minimization Gate and probe sensitive fields",
    tag: "Quarantine",
  },
  {
    title: "3+1 LangGraph Planes",
    subtitle: "Explain multi-agent execution architecture",
    prompt: "Explain the 3+1 LangGraph Planes architecture and how agents collaborate",
    tag: "Multi-Agent",
  },
  {
    title: "Entropy Reduction Metric",
    subtitle: "Examine mathematical H(S) convergence curve",
    prompt: "Explain the Uncertainty Entropy Reduction Metric H(S)",
    tag: "Mathematics",
  },
  {
    title: "Human Adjudicator Sign-Off",
    subtitle: "Examine Rule 5 clearance workflow in CASE-003",
    prompt: "Show the Human-in-the-Loop Adjudicator Sign-off Workflow for CASE-003",
    tag: "Governance",
  },
];

export function ChatbotInterface({
  apiKey,
  onOpenApiKeyModal,
  onNavigateToTab,
  onOpenHumanReview,
}: ChatbotInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      role: "assistant",
      content: `Welcome to the **Project Awaaz Agentic AI Supervisory Console**.

I coordinate evidence-grounded multi-agent case resolution across connected municipal transit corridors while strictly enforcing zero-harm, privacy-preserving governance.

Select one of the suggested inquiries below or submit a custom inquiry to inspect how our 3+1 LangGraph planes, FastMCP quarantine gate, and deterministic policy engine operate in real time.`,
      cleanContent: `Welcome to the **Project Awaaz Agentic AI Supervisory Console**.

I coordinate evidence-grounded multi-agent case resolution across connected municipal transit corridors while strictly enforcing zero-harm, privacy-preserving governance.

Select one of the suggested inquiries below or submit a custom inquiry to inspect how our 3+1 LangGraph planes, FastMCP quarantine gate, and deterministic policy engine operate in real time.`,
      actions: [],
      timestamp: "13:30 IST",
      mode: apiKey ? "gemini" : "sovereign",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [probingField, setProbingField] = useState<string | null>(null);
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      cleanContent: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(query, messages, apiKey);
      const { cleanContent, actions } = parseMessageActions(response.reply);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        cleanContent,
        actions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode: response.mode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleProbe = async (field: string) => {
    setProbingField(field);
    setProbeResult(null);
    try {
      const res = await probeFastMCPField(field, "CASE-002");
      setProbeResult(res);
    } finally {
      setProbingField(null);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "initial-welcome-reset",
        role: "assistant",
        content: "Conversation history cleared. Ready for your inquiry.",
        cleanContent: "Conversation history cleared. Ready for your inquiry.",
        actions: [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode: apiKey ? "gemini" : "sovereign",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[640px] glass-panel rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
      {/* Top Chat Console Bar */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-trust-600/20 border border-trust-500/40 flex items-center justify-center text-trust-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Awaaz Supervisory Agent
              </h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  apiKey
                    ? "bg-trust-950 text-trust-300 border-trust-600/40"
                    : "bg-emerald-950 text-emerald-400 border-emerald-800/40"
                }`}
              >
                {apiKey ? "Gemini 2.5 Flash Active" : "Sovereign Mode (Offline Grounded)"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Evidence Grounding • Pre-LLM Quarantine • Deterministic Zero-LLM Governance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenApiKeyModal}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
            title="Configure Google Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-trust-400" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Suggested Inquiries Chip Grid (Always available at top) */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-trust-400" />
              Suggested Inquiries &amp; Feature Showcase:
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Click to Run
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {SUGGESTED_PROMPTS.map((item) => (
              <button
                key={item.title}
                onClick={() => handleSend(item.prompt)}
                disabled={isTyping}
                className="text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-trust-500/50 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1">
                    {item.title}
                  </span>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-trust-300 border border-slate-700">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {item.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="space-y-6">
          {messages.map((m) => {
            const isUser = m.role === "user";

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isUser
                      ? "bg-trust-600 border-trust-400 text-white"
                      : "bg-slate-900 border-slate-700 text-trust-400"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-3xl rounded-2xl p-4 sm:p-5 border space-y-3 ${
                    isUser
                      ? "bg-trust-950/70 border-trust-500/60 text-slate-100"
                      : "bg-slate-900/80 border-slate-800 text-slate-200 shadow-xl"
                  }`}
                >
                  {/* Message Meta */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-current/10 pb-2">
                    <span className="font-semibold">
                      {isUser ? "Adjudicator / Judge" : "Awaaz Supervisory Agent"}
                    </span>
                    <span className="font-mono">{m.timestamp}</span>
                  </div>

                  {/* Clean Markdown Text Content */}
                  <div className="text-xs sm:text-sm leading-relaxed prose prose-invert max-w-none space-y-2">
                    {m.cleanContent?.split("\n\n").map((para, i) => (
                      <p key={i} className="whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* DYNAMIC IN-CHAT WIDGET: Signature Contradiction Card */}
                  {m.actions?.includes("SHOW_SIGNATURE_CARD") && (
                    <div className="pt-3 border-t border-slate-800">
                      <SignatureCard
                        similarityScore={0.94}
                        facialScore={0.984}
                        contradictionReason="Physical marker contradiction detected: left forearm != right forearm"
                      />
                    </div>
                  )}

                  {/* DYNAMIC IN-CHAT WIDGET: FastMCP Quarantine Interactive Probe */}
                  {m.actions?.includes("PROBE_QUARANTINE") && (
                    <div className="pt-3 border-t border-slate-800 space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800/90">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-trust-400" />
                          Interactive FastMCP Quarantine Tester
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">0 Leaks</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleProbe("exact_address")}
                          disabled={probingField !== null}
                          className="px-2.5 py-1.5 rounded-lg bg-crimson-950/60 hover:bg-crimson-900 border border-crimson-500/50 text-xs font-mono text-crimson-200 transition-colors"
                        >
                          Probe: exact_address
                        </button>
                        <button
                          onClick={() => handleProbe("biometric_hash")}
                          disabled={probingField !== null}
                          className="px-2.5 py-1.5 rounded-lg bg-crimson-950/60 hover:bg-crimson-900 border border-crimson-500/50 text-xs font-mono text-crimson-200 transition-colors"
                        >
                          Probe: biometric_hash
                        </button>
                        <button
                          onClick={() => handleProbe("physical_markers")}
                          disabled={probingField !== null}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/50 text-xs font-mono text-emerald-200 transition-colors"
                        >
                          Probe: physical_markers (Safe)
                        </button>
                      </div>

                      {probeResult && (
                        <div
                          className={`p-3 rounded-lg border text-xs font-mono ${
                            probeResult.status === "BLOCKED"
                              ? "bg-crimson-950/80 border-crimson-500 text-crimson-200"
                              : "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                          }`}
                        >
                          <div className="font-bold">FastMCP: {probeResult.status}</div>
                          {probeResult.exception && (
                            <div className="text-[11px] mt-1 text-crimson-300 font-semibold">
                              {probeResult.exception}
                            </div>
                          )}
                          {probeResult.response && (
                            <div className="text-[11px] mt-1 text-emerald-200">
                              Response: {JSON.stringify(probeResult.response)}
                            </div>
                          )}
                          <div className="text-[10px] opacity-80 mt-1 font-sans">
                            {probeResult.governanceMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DYNAMIC IN-CHAT WIDGET: Stepped LangGraph Trace */}
                  {(m.actions?.includes("SHOW_TRACE") || m.actions?.includes("RUN_CASE_001")) && (
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <ExecutionTraceTimeline
                        steps={
                          m.actions?.includes("RUN_CASE_001")
                            ? MOCK_RESULTS["CASE-001"].steps
                            : MOCK_RESULTS["CASE-002"].steps
                        }
                        currentStepIndex={3}
                        terminalState={
                          m.actions?.includes("RUN_CASE_001")
                            ? "INVESTIGATE"
                            : "HOLD"
                        }
                      />
                    </div>
                  )}

                  {/* DYNAMIC IN-CHAT WIDGET: Uncertainty Entropy Curve */}
                  {m.actions?.includes("SHOW_ENTROPY") && (
                    <div className="pt-3 border-t border-slate-800">
                      <EntropyReductionChart
                        entropyHistory={[1.0, 0.75, 0.5, 0.35]}
                        terminalState="INVESTIGATE"
                      />
                    </div>
                  )}

                  {/* DYNAMIC IN-CHAT WIDGET: CASE-003 Human Clearance Callout */}
                  {m.actions?.includes("RUN_CASE_003") && (
                    <div className="pt-3 border-t border-slate-800 bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/50 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Policy Rule 5: 100% Corroborated
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">Terminal: HUMAN_REVIEW_REQUIRED</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        All dimensions verified with zero anomalies. Click below to launch the official human sign-off panel:
                      </p>
                      <button
                        onClick={() => onOpenHumanReview && onOpenHumanReview("CASE-003")}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Open Adjudicator Clearance Sign-Off</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-trust-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 animate-pulse text-trust-400" />
                <span>Supervisory Agent is synthesizing grounded response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 max-w-4xl mx-auto"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about Project Awaaz architecture, contradiction override, or FastMCP..."
              disabled={isTyping}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-trust-500 transition-colors shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-trust-600 to-indigo-600 hover:from-trust-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-trust-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
