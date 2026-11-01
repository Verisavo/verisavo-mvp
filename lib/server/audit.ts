import "server-only";
import { db } from "@/lib/server/db";
import { auditEvents } from "@/db/schema";

type AuditDetails = {
  actorId?: string | null;
  targetType?: string | null;
  targetId?: string | number | null;
  metadata?: Record<string, unknown> | null;
};

// Records an event for the admin activity log. A failure here must never break the user's action, so it only logs.
export async function audit(action: string, { actorId = null, targetType = null, targetId = null, metadata = null }: AuditDetails = {}) {
  try {
    await db.insert(auditEvents).values({ action, actorId, targetType, targetId: targetId == null ? null : String(targetId), metadata });
  } catch (err) {
    console.error("[audit] could not record", action, err instanceof Error ? err.name : "error");
  }
}
