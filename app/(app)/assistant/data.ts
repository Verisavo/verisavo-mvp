// Content of the assistant page: example questions (same as the original assistant window); markets live in lib/markets.ts
export { MARKETS } from "@/lib/markets";

export const CHIPS = [
  { label: "Explore a market", q: "What does the market for our product look like?" },
  { label: "Compare locations", q: "Where should we launch first, and why?" },
  { label: "Investigate a gap", q: "What don’t we know yet that could change our plan?" },
  { label: "Test an assumption", q: "What evidence supports or contradicts our main assumption?" }
];

export const MORE_CHIPS = [
  { label: "Track prices", q: "How have prices in our category changed recently?" },
  { label: "Map stockouts", q: "Where do stockouts happen most often?" },
  { label: "Check a competitor", q: "What has changed about our main competitor recently?" }
];

// Attachments (M3.6, paid only; the server enforces the same limits in lib/server/assistant/attachments.ts)
export const MAX_FILES = 5;
export const MAX_MB = 4;
export const ACCEPT = ".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,image/png,image/jpeg,image/webp,image/gif";

// How the landing page hands a question over: sessionStorage["verisavo-ask"] = JSON { q, scope }
export const HANDOFF_KEY = "verisavo-ask";
