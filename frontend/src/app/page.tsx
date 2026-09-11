"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { CaseSidebar } from "../components/CaseSidebar";
import { ExecutionTraceTimeline } from "../components/ExecutionTraceTimeline";
import { SignatureCard } from "../components/SignatureCard";
import { DataMinimizationDrawer } from "../components/DataMinimizationDrawer";
import { EntropyReductionChart } from "../components/EntropyReductionChart";
import { EvidenceInspector } from "../components/EvidenceInspector";
import { HumanReviewModal } from "../components/HumanReviewModal";
import { ChatbotInterface } from "../components/ChatbotInterface";
import { ApiKeyModal } from "../components/ApiKeyModal";
import { MOCK_CASES, MOCK_RESULTS } from "../lib/mockData";
import { CaseDossier, InvestigationResult, LangGraphStep } from "../lib/types";
import {
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  Layers,
  Database,
  Radio,
  FileCheck,
  Send,
  Building,
  Terminal,
  Activity,
  Sliders,
  ChevronRight,
  ExternalLink,
  Bot,
  Sparkles,
} from "lucide-react";
import { dispatchCivicResources, DispatchResponse } from "../lib/api";

export default function DashboardPage() {
  const [cases] = useState<CaseDossier[]>(Object.values(MOCK_CASES));
  const [selectedCaseId, setSelectedCaseId] = useState<string>("CASE-002"); // Default to CASE-002 to immediately highlight signature feature
  const [engineMode, setEngineMode] = useState<"sovereign" | "gemini">("sovereign");
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isDataMinimizationOpen, setIsDataMinimizationOpen] = useState<boolean>(false);
  const [isHumanReviewOpen, setIsHumanReviewOpen] = useState<boolean>(false);

  // Read stored Gemini API Key on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("gemini_api_key") || "";
      if (storedKey) {
        setApiKey(storedKey);
        setEngineMode("gemini");
      }
    }
  }, []);

  // Investigation state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(true); // Pre-run state so judges see full results immediately
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(3); // Show full steps initially
  const [currentResult, setCurrentResult] = useState<InvestigationResult>(
    MOCK_RESULTS["CASE-002"]
  );

  // Civic Telemetry Dispatch state
  const [dispatchPriority, setDispatchPriority] = useState<"HIGH" | "CRITICAL" | "STANDARD">("CRITICAL");
  const [dispatchHub, setDispatchHub] = useState<string>("Patna Junction Platform 2");
  const [dispatchResponse, setDispatchResponse] = useState<DispatchResponse | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Active view tab - default to 'chat' for the primary Agentic AI Chatbot interface
  const [activeTab, setActiveTab] = useState<"chat" | "investigation" | "rag" | "civic">(
    "chat"
  );

  // When selected case changes, update the result
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    const res = MOCK_RESULTS[caseId] || MOCK_RESULTS["CASE-001"];
    setCurrentResult(res);
    setCurrentStepIndex(res.steps.length - 1);
    setHasRun(true);
  };

  // Run or re-run investigation with real-time stepped playback
  const handleRunInvestigation = async () => {
    setIsRunning(true);
    setCurrentStepIndex(-1);
    setHasRun(false);

    const targetResult = MOCK_RESULTS[selectedCaseId] || MOCK_RESULTS["CASE-001"];
    setCurrentResult(targetResult);

    // Step through each LangGraph plane
    for (let i = 0; i < targetResult.steps.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      setCurrentStepIndex(i);
    }

    setIsRunning(false);
    setHasRun(true);
  };

  const handleCivicDispatch = async () => {
    setIsDispatching(true);
    setDispatchResponse(null);
    try {
      const res = await dispatchCivicResources(selectedCaseId, dispatchPriority, dispatchHub);
      setDispatchResponse(res);
    } finally {
      setIsDispatching(false);
    }
  };

  const isCase2 = selectedCaseId === "CASE-002";
  const isCase3 = selectedCaseId === "CASE-003";

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col text-slate-100">
      {/* Top Authoritative Header */}
      <Navbar
        engineMode={engineMode}
        setEngineMode={setEngineMode}
        onOpenDataMinimization={() => setIsDataMinimizationOpen(true)}
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "chat"
                  ? "bg-gradient-to-r from-trust-600 to-indigo-600 text-white shadow-lg shadow-trust-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Bot className="w-4 h-4 text-trust-300" />
              <span>Agentic AI Assistant</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-trust-500/20 text-trust-300 font-semibold border border-trust-500/30">
                Primary
              </span>
            </button>

            <button
              onClick={() => setActiveTab("investigation")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "investigation"
                  ? "bg-gradient-to-r from-trust-600 to-indigo-600 text-white shadow-lg shadow-trust-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Observability Trace &amp; Governance</span>
            </button>

            <button
              onClick={() => setActiveTab("rag")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "rag"
                  ? "bg-gradient-to-r from-trust-600 to-indigo-600 text-white shadow-lg shadow-trust-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>ChromaDB Hybrid RAG Inspector</span>
            </button>

            <button
              onClick={() => setActiveTab("civic")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "civic"
                  ? "bg-gradient-to-r from-trust-600 to-indigo-600 text-white shadow-lg shadow-trust-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Smart Civic Telemetry</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDataMinimizationOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <span>Inspect FastMCP Quarantine</span>
              <ChevronRight className="w-3.5 h-3.5 text-trust-400" />
            </button>
          </div>
        </div>

        {/* Tab 0: Agentic AI Assistant (Primary Default Interface) */}
        {activeTab === "chat" && (
          <ChatbotInterface
            apiKey={apiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenHumanReview={(caseId) => {
              setSelectedCaseId(caseId);
              setIsHumanReviewOpen(true);
            }}
          />
        )}

        {/* Tab 1: Investigation & Governance Trace */}
        {activeTab === "investigation" && (
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Left Column: Test Case Selector & Case Dossier */}
            <CaseSidebar
              cases={cases}
              selectedCaseId={selectedCaseId}
              onSelectCase={handleSelectCase}
              isRunning={isRunning}
              onRunInvestigation={handleRunInvestigation}
              hasRun={hasRun}
              onOpenDataMinimization={() => setIsDataMinimizationOpen(true)}
            />

            {/* Right Main Column: Execution Timeline, Signature Card, and Telemetry */}
            <div className="flex-1 w-full space-y-6">
              {/* THE SIGNATURE FEATURE CARD: RENDER PROMINENTLY FOR CASE-002 */}
              {isCase2 && (
                <SignatureCard
                  similarityScore={currentResult.similarity_score || 0.94}
                  facialScore={0.984}
                  contradictionReason={
                    currentResult.contradictions[0]?.reason ||
                    "Physical marker contradiction detected: left forearm != right forearm"
                  }
                />
              )}

              {/* Clean Corroboration Card for CASE-003 */}
              {isCase3 && hasRun && currentResult.terminal_state === "HUMAN_REVIEW_REQUIRED" && (
                <div className="bg-emerald-950/40 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                          Policy Rule 5 Enforced • All Dimensions Confirmed
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          Human Review Queue Authorized
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsHumanReviewOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Launch Adjudicator Sign-Off</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    All 4 required dimensions (Identity, Origin, Timeline, Physical Markers) have achieved 98% corroboration across Varanasi Smart City CCTV and hospital triage records with zero anomalies. In accordance with the governance directive, autonomous execution halts here for certified officer review.
                  </p>
                </div>
              )}

              {/* Missing Timeline Warning Card for CASE-001 */}
              {selectedCaseId === "CASE-001" && hasRun && (
                <div className="bg-amber-950/40 border border-amber-500/70 rounded-2xl p-5 shadow-xl flex items-start gap-3.5">
                  <AlertOctagon className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-amber-400 uppercase">
                      Policy Rule 4 Enforced • Pending Corroboration
                    </div>
                    <div className="text-sm font-bold text-white">
                      Timeline Gap Identified (Terminal State: INVESTIGATE)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Subject identity and origin verified, but secondary transit corridor connecting legs remain uncorroborated. Escalation halted; FastMCP municipal transit dispatch triggered to verify CCTV footage at connecting hubs.
                    </p>
                  </div>
                </div>
              )}

              {/* Live LangGraph Execution Trace Timeline */}
              <ExecutionTraceTimeline
                steps={currentResult.steps}
                currentStepIndex={currentStepIndex}
                terminalState={hasRun ? currentResult.terminal_state : undefined}
                policyRuleTriggered={currentResult.policy_rule_triggered}
              />

              {/* Uncertainty Entropy Reduction Curve */}
              <EntropyReductionChart
                entropyHistory={currentResult.entropy_history}
                terminalState={currentResult.terminal_state}
              />
            </div>
          </div>
        )}

        {/* Tab 2: RAG Evidence Inspector */}
        {activeTab === "rag" && <EvidenceInspector />}

        {/* Tab 3: Smart Civic Telemetry */}
        {activeTab === "civic" && (
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-trust-400" />
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Smart Civic Infrastructure &amp; Transit Telemetry
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dispatch FastMCP municipal child-protection alerts across connected railway concourses and ISBT terminals without exposing minor PII.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-trust-950 text-trust-300 border border-trust-800">
                Tool: allocate_civic_resources()
              </span>
            </div>

            {/* Dispatch Configuration Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Target Transit Hub
                </label>
                <select
                  value={dispatchHub}
                  onChange={(e) => setDispatchHub(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-trust-500"
                >
                  <option value="Patna Junction Platform 2">Patna Junction Platform 2 (ECR)</option>
                  <option value="Birsa Munda ISBT Bay 4">Birsa Munda ISBT Bay 4 (Ranchi)</option>
                  <option value="Varanasi Godowlia Chowk Gate">Varanasi Godowlia Chowk Gate</option>
                  <option value="PMCH Pediatric Emergency Kiosk">PMCH Pediatric Emergency Kiosk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Alert Priority Level
                </label>
                <select
                  value={dispatchPriority}
                  onChange={(e) => setDispatchPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-trust-500"
                >
                  <option value="CRITICAL">CRITICAL (Red Priority Flag)</option>
                  <option value="HIGH">HIGH (Surveillance Priority)</option>
                  <option value="STANDARD">STANDARD (Checkpoint Advisory)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleCivicDispatch}
                  disabled={isDispatching}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-trust-600 to-indigo-600 hover:from-trust-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-trust-600/30 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDispatching ? "Simulating FastMCP Dispatch..." : "Dispatch Civic Alert"}</span>
                </button>
              </div>
            </div>

            {/* Dispatch Response Preview */}
            {dispatchResponse && (
              <div className="bg-slate-950/80 border border-trust-500/50 rounded-xl p-5 space-y-3 font-mono text-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    FastMCP Municipal Dispatch Confirmed
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    PII Quarantine Enforced: TRUE
                  </span>
                </div>

                <div className="text-slate-300 leading-relaxed font-sans text-xs">
                  {dispatchResponse.message}
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
                  <div className="text-slate-400">
                    Disclosed Attributes to Municipal Hub:
                  </div>
                  <pre className="text-emerald-300">
                    {JSON.stringify(dispatchResponse.disclosed_attributes, null, 2)}
                  </pre>
                  <div className="text-slate-400 pt-1">
                    Quarantined Sensitive Attributes (0 Disclosed):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dispatchResponse.quarantined_attributes.map((q) => (
                      <span
                        key={q}
                        className="px-2 py-0.5 rounded bg-crimson-950 text-crimson-400 border border-crimson-800 text-[10px]"
                      >
                        {q}: [PROTECTED]
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Data Minimization Inspector Drawer / Modal */}
      <DataMinimizationDrawer
        isOpen={isDataMinimizationOpen}
        onClose={() => setIsDataMinimizationOpen(false)}
      />

      {/* Human Adjudicator Sign-Off Modal */}
      <HumanReviewModal
        isOpen={isHumanReviewOpen}
        onClose={() => setIsHumanReviewOpen(false)}
        caseId={selectedCaseId}
      />

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={(key) => {
          setApiKey(key);
          if (key) {
            localStorage.setItem("gemini_api_key", key);
            setEngineMode("gemini");
          } else {
            localStorage.removeItem("gemini_api_key");
            setEngineMode("sovereign");
          }
        }}
      />
    </div>
  );
}
