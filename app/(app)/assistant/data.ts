// Content of the assistant page: market scopes and example questions (same as the original assistant window)
export const MARKETS = [
  "All markets", "Nigeria", "Ghana", "Kenya", "South Africa", "Côte d’Ivoire",
  "Egypt", "Morocco", "Senegal", "Ethiopia", "Tanzania"
] as const;

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

// Attachments (paid only from M3; the server checks again)
export const MAX_FILES = 10;
export const MAX_MB = 20;
export const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,image/*";

// How the landing page hands a question over: sessionStorage["verisavo-ask"] = JSON { q, scope }
export const HANDOFF_KEY = "verisavo-ask";
