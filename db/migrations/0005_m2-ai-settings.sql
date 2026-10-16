CREATE TABLE "ai_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"answer_provider" text NOT NULL,
	"answer_model" text NOT NULL,
	"embedding_model" text NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_settings_single_row" CHECK ("ai_settings"."id" = 1),
	CONSTRAINT "ai_settings_answer_provider_check" CHECK ("ai_settings"."answer_provider" in ('anthropic', 'openai', 'google'))
);
--> statement-breakpoint
ALTER TABLE "ai_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ai_settings" ADD CONSTRAINT "ai_settings_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;