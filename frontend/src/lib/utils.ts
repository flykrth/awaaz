import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function truncateHash(hash: string, length = 12): string {
  if (!hash || hash.length <= length) return hash;
  return `${hash.slice(0, length)}...`;
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30";
    case "MISSING":
      return "bg-amber-950/60 text-amber-400 border border-amber-500/30";
    case "CONTRADICTED":
      return "bg-rose-950/60 text-rose-400 border border-rose-500/30";
    default:
      return "bg-slate-800 text-slate-400 border border-slate-700";
  }
}

export function getTerminalStateBadgeClass(state: string): string {
  switch (state) {
    case "HOLD":
      return "bg-crimson-950 text-crimson-300 border-crimson-500/60 animate-glow-red";
    case "HUMAN_REVIEW_REQUIRED":
      return "bg-emerald-950 text-emerald-300 border-emerald-500/60";
    case "REQUEST_INFORMATION":
      return "bg-amber-950 text-amber-300 border-amber-500/60";
    case "INVESTIGATE":
      return "bg-trust-950 text-trust-300 border-trust-500/60";
    default:
      return "bg-slate-900 text-slate-300 border-slate-700";
  }
}
