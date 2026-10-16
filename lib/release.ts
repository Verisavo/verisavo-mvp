// Which milestones are switched on in this deployment. Each Friday release raises RELEASE_STAGE by one
// (1 = M1 accounts and dashboard, 2 = M2 admin and knowledge base, 3 = M3 assistant and billing, 4 = M4 WhatsApp, 5 = M5).
// Unset means 0 in production, so nothing unreleased can leak, and 5 (everything) in development.
const raw = process.env.RELEASE_STAGE ?? (process.env.NODE_ENV === "production" ? "0" : "5");
export const releaseStage: number = Number.isInteger(Number(raw)) ? Number(raw) : 0;

export const released = (milestone: number): boolean => releaseStage >= milestone;
