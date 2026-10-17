// Database schema (Drizzle). After changing this file run `npm run db:generate` to create a migration,
// then `npm run db:migrate` to apply it. Every table enables RLS: our server connects as the table owner
// and is not affected, but nothing is readable through Supabase's public API.
import { sql } from "drizzle-orm";
import { bigint, boolean, check, index, integer, jsonb, pgTable, primaryKey, smallint, text, timestamp, uniqueIndex, uuid, vector } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// M1: one row per Supabase Auth user, created by the on_auth_user_created trigger (migration 0002_profile-on-signup.sql).
// The email lives in auth.users; name and organisation come from the sign-up form.
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => authUsers.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  organisation: text("organisation"),
  role: text("role").notNull().default("user"),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  stripeCustomerId: text("stripe_customer_id").unique(),   // M3: set on first checkout
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, t => [
  check("profiles_role_check", sql`${t.role} in ('user', 'admin')`)
]).enableRLS();

// M1 lists them on the dashboard; M3 fills them from the web assistant, M4 from WhatsApp.
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New conversation"),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, t => [
  index("conversations_user_updated_idx").on(t.userId, t.updatedAt.desc())
]).enableRLS();

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  channel: text("channel").notNull().default("web"),
  content: text("content").notNull(),
  sources: jsonb("sources"),                 // assistant: the knowledge-base sections it was given [{ documentId, title }]
  market: text("market"),                    // user: the market scope the question was asked in
  model: text("model"),                      // assistant: "<provider>:<model id>" that wrote the answer
  usage: jsonb("usage"),                     // assistant: { inputTokens, outputTokens }, for cost tracking
  createdAt: createdAt()
}, t => [
  index("messages_conversation_created_idx").on(t.conversationId, t.createdAt),
  check("messages_role_check", sql`${t.role} in ('user', 'assistant')`),
  check("messages_channel_check", sql`${t.channel} in ('web', 'whatsapp')`)
]).enableRLS();

// Who did what, for the admin activity log (M2.4). Never store passwords, tokens or message text here.
export const auditEvents = pgTable("audit_events", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  actorId: uuid("actor_id").references(() => profiles.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadata: jsonb("metadata"),
  createdAt: createdAt()
}, t => [
  index("audit_events_created_idx").on(t.createdAt.desc()),
  index("audit_events_actor_idx").on(t.actorId)
]).enableRLS();

// M2: the knowledge base. A document has versions (each edit is a new version). Publishing splits the current
// version into chunks and stores their embeddings in kb_chunks. Only published documents have chunks, so search never
// needs a status check, and archiving a document deletes its chunks.
export const EMBEDDING_DIMENSIONS = 1536;   // every option in EMBEDDINGS (lib/server/ai/providers.ts) is asked for this size

export const kbDocuments = pgTable("kb_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  markets: text("markets").array().notNull().default(sql`'{}'::text[]`),   // empty = applies to all markets
  sourceName: text("source_name"),                                            // original file name, if uploaded
  currentVersionId: uuid("current_version_id"),
  chunkCount: integer("chunk_count").notNull().default(0),
  embedError: text("embed_error"),                                            // last publishing problem, shown to admins
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true })
}, t => [
  check("kb_documents_status_check", sql`${t.status} in ('draft', 'published', 'archived')`),
  index("kb_documents_status_idx").on(t.status, t.updatedAt.desc())
]).enableRLS();

export const kbVersions = pgTable("kb_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => kbDocuments.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  createdAt: createdAt()
}, t => [
  index("kb_versions_document_idx").on(t.documentId, t.createdAt.desc())
]).enableRLS();

export const kbChunks = pgTable("kb_chunks", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  documentId: uuid("document_id").notNull().references(() => kbDocuments.id, { onDelete: "cascade" }),
  versionId: uuid("version_id").notNull().references(() => kbVersions.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  markets: text("markets").array().notNull().default(sql`'{}'::text[]`),
  embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }).notNull(),
  embeddingModel: text("embedding_model").notNull()
}, t => [
  index("kb_chunks_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  index("kb_chunks_document_idx").on(t.documentId)
]).enableRLS();

// M2: which AI service answers questions and which one powers knowledge search, chosen in Admin → AI (decision D6).
// A single row. The keys are never stored here; they live in the hosting environment.
export const aiSettings = pgTable("ai_settings", {
  id: smallint("id").primaryKey().default(1),
  answerProvider: text("answer_provider").notNull(),
  answerModel: text("answer_model").notNull(),
  embeddingModel: text("embedding_model").notNull(),   // an EMBEDDINGS key, e.g. "openai:text-embedding-3-small"
  updatedBy: uuid("updated_by").references(() => profiles.id, { onDelete: "set null" }),
  updatedAt: updatedAt()
}, t => [
  check("ai_settings_single_row", sql`${t.id} = 1`),
  check("ai_settings_answer_provider_check", sql`${t.answerProvider} in ('anthropic', 'openai', 'google')`)
]).enableRLS();

// M3: Stripe subscriptions, one row per Stripe subscription, kept in sync by the webhook (see verisavo-stripe-billing).
// A user is paid while a row is active, trialing or past_due (decision D9: access continues while Stripe retries).
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  priceId: text("price_id"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  updatedAt: updatedAt()
}, t => [
  index("subscriptions_user_idx").on(t.userId)
]).enableRLS();

// Webhook events already handled, so a redelivered event does nothing
export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow()
}).enableRLS();

// M3: usage (see verisavo-entitlements; decision D4: each question counts 1, refunded if the AI fails to answer).
// Counters only change through lib/server/entitlements.ts, with conditional updates so parallel requests can't
// get past the limit.
export const freeUsage = pgTable("free_usage", {
  userId: uuid("user_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  used: integer("used").notNull().default(0)
}).enableRLS();

// One row per paid billing period (from Stripe); a renewal starts a new row, which is the monthly reset
export const usagePeriods = pgTable("usage_periods", {
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  allowance: integer("allowance").notNull(),
  used: integer("used").notNull().default(0)
}, t => [
  primaryKey({ columns: [t.userId, t.periodStart] })
]).enableRLS();

// Every counted question. (channel, external_id) is unique, so a retried request (double click, WhatsApp
// redelivery) is never counted twice; bucket and period_start say which counter a refund goes back to.
export const usageEvents = pgTable("usage_events", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  externalId: text("external_id").notNull(),   // web: the browser's request id; WhatsApp: the message id
  bucket: text("bucket").notNull(),
  periodStart: timestamp("period_start", { withTimezone: true }),
  refundedAt: timestamp("refunded_at", { withTimezone: true }),
  createdAt: createdAt()
}, t => [
  uniqueIndex("usage_events_channel_external_idx").on(t.channel, t.externalId),
  index("usage_events_user_created_idx").on(t.userId, t.createdAt.desc()),
  check("usage_events_channel_check", sql`${t.channel} in ('web', 'whatsapp')`),
  check("usage_events_bucket_check", sql`${t.bucket} in ('free', 'paid')`)
]).enableRLS();

// Row types for server code
export type KbDocument = typeof kbDocuments.$inferSelect;
export type KbVersion = typeof kbVersions.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

// Security: app-side rate limits. Only our server talks to Supabase Auth, so Supabase sees one address for every
// visitor and its own per-IP limits can't tell people apart. These counters can (see lib/server/rate-limit.ts).
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),   // e.g. "login:ip:203.0.113.7" or "forgot:email:a@b.co"
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  count: bigint("count", { mode: "number" }).notNull().default(0)
}).enableRLS();

// A password-reset link allows one password change, only in the session that link created
// (written by /auth/confirm, used up by /api/auth/reset; see lib/server/recovery.ts)
export const recoveryGrants = pgTable("recovery_grants", {
  sessionId: text("session_id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
}).enableRLS();
