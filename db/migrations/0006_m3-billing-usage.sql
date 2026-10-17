CREATE TABLE "free_usage" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"used" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "free_usage" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stripe_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text NOT NULL,
	"price_id" text,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "usage_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"external_id" text NOT NULL,
	"bucket" text NOT NULL,
	"period_start" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usage_events_channel_check" CHECK ("usage_events"."channel" in ('web', 'whatsapp')),
	CONSTRAINT "usage_events_bucket_check" CHECK ("usage_events"."bucket" in ('free', 'paid'))
);
--> statement-breakpoint
ALTER TABLE "usage_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "usage_periods" (
	"user_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"allowance" integer NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "usage_periods_user_id_period_start_pk" PRIMARY KEY("user_id","period_start")
);
--> statement-breakpoint
ALTER TABLE "usage_periods" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "market" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "model" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "usage" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "free_usage" ADD CONSTRAINT "free_usage_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_periods" ADD CONSTRAINT "usage_periods_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_events_channel_external_idx" ON "usage_events" USING btree ("channel","external_id");--> statement-breakpoint
CREATE INDEX "usage_events_user_created_idx" ON "usage_events" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_stripe_customer_id_unique" UNIQUE("stripe_customer_id");