CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"conversation_id" uuid,
	"message_id" uuid,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"media_type" text NOT NULL,
	"size" integer NOT NULL,
	"text" text,
	"data" "bytea",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attachments_kind_check" CHECK ("attachments"."kind" in ('document', 'image'))
);
--> statement-breakpoint
ALTER TABLE "attachments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_conversation_idx" ON "attachments" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "attachments_user_created_idx" ON "attachments" USING btree ("user_id","created_at");