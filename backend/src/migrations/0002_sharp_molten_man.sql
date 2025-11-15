CREATE TABLE "pet_reviews" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"pet_id" varchar(128) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"adoption_request_id" varchar(128),
	"rating" integer NOT NULL,
	"title" varchar(200),
	"comment" text NOT NULL,
	"images" text,
	"is_approved" boolean DEFAULT true,
	"moderation_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shelter_reviews" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"shelter_id" varchar(128) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(200),
	"comment" text NOT NULL,
	"communication_rating" integer,
	"facility_rating" integer,
	"process_rating" integer,
	"images" text,
	"is_approved" boolean DEFAULT true,
	"moderation_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_logs" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"admin_id" varchar(128),
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" varchar(128),
	"description" text,
	"metadata" text,
	"ip_address" varchar(45),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "statistics" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"total_users" integer DEFAULT 0,
	"total_shelters" integer DEFAULT 0,
	"total_pets" integer DEFAULT 0,
	"total_adoptions" integer DEFAULT 0,
	"total_requests" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"new_users" integer DEFAULT 0,
	"new_pets" integer DEFAULT 0,
	"new_requests" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pet_reviews" ADD CONSTRAINT "pet_reviews_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_reviews" ADD CONSTRAINT "pet_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelter_reviews" ADD CONSTRAINT "shelter_reviews_shelter_id_shelters_id_fk" FOREIGN KEY ("shelter_id") REFERENCES "public"."shelters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelter_reviews" ADD CONSTRAINT "shelter_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pet_reviews_pet_idx" ON "pet_reviews" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "pet_reviews_user_idx" ON "pet_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pet_reviews_rating_idx" ON "pet_reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "pet_reviews_created_idx" ON "pet_reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "shelter_reviews_shelter_idx" ON "shelter_reviews" USING btree ("shelter_id");--> statement-breakpoint
CREATE INDEX "shelter_reviews_user_idx" ON "shelter_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shelter_reviews_rating_idx" ON "shelter_reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "shelter_reviews_created_idx" ON "shelter_reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "admin_logs_admin_idx" ON "admin_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "admin_logs_action_idx" ON "admin_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "admin_logs_entity_idx" ON "admin_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "admin_logs_created_idx" ON "admin_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "statistics_date_idx" ON "statistics" USING btree ("date");