ALTER TABLE "pets" ADD COLUMN "listing_type" varchar(20) DEFAULT 'adopt';--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD COLUMN "request_type" varchar(20) DEFAULT 'adopt';--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD COLUMN "foster_duration_weeks" integer;--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD COLUMN "foster_notes" text;--> statement-breakpoint
CREATE INDEX "pets_listing_type_idx" ON "pets" USING btree ("listing_type");
