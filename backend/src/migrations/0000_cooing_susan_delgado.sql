CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20),
	"profile_image" text,
	"role" varchar(20) DEFAULT 'adopter' NOT NULL,
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100) DEFAULT 'India',
	"zip_code" varchar(20),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"email_verified_at" timestamp,
	"profile_complete" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "shelters" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"organization_name" varchar(200) NOT NULL,
	"registration_number" varchar(100),
	"license_number" varchar(100),
	"website" varchar(255),
	"description" text,
	"established_year" integer,
	"capacity" integer,
	"current_pet_count" integer DEFAULT 0,
	"documents_verified" boolean DEFAULT false,
	"verification_status" varchar(20) DEFAULT 'pending',
	"verification_date" timestamp with time zone,
	"average_rating" numeric(3, 2) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0,
	"operating_hours" text,
	"social_links" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "shelters_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"refresh_token" text NOT NULL,
	"device_info" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"is_active" boolean DEFAULT true,
	"last_used_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"name" varchar(100) NOT NULL,
	"species" varchar(50) NOT NULL,
	"breed" varchar(100),
	"mixed_breed" boolean DEFAULT false,
	"age" integer,
	"age_unit" varchar(10) DEFAULT 'months',
	"birth_date" timestamp with time zone,
	"age_estimated" boolean DEFAULT false,
	"gender" varchar(10) NOT NULL,
	"size" varchar(20),
	"weight" numeric(5, 2),
	"color" varchar(100),
	"markings" text,
	"is_vaccinated" boolean DEFAULT false,
	"is_neutered" boolean DEFAULT false,
	"is_spayed" boolean DEFAULT false,
	"health_status" varchar(50) DEFAULT 'healthy',
	"medical_history" text,
	"special_needs" text,
	"vet_records" text,
	"good_with_kids" boolean,
	"good_with_pets" boolean,
	"good_with_cats" boolean,
	"good_with_dogs" boolean,
	"energy_level" varchar(20),
	"trained_level" varchar(20),
	"house_trained" boolean DEFAULT false,
	"adoption_status" varchar(20) DEFAULT 'available',
	"adoption_fee" numeric(10, 2) DEFAULT '0',
	"is_urgent" boolean DEFAULT false,
	"urgent_reason" text,
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100) DEFAULT 'India',
	"zip_code" varchar(20),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"description" text,
	"story" text,
	"personality_traits" text,
	"primary_image" text,
	"search_keywords" text,
	"slug" varchar(200),
	"view_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"inquiry_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"featured_until" timestamp with time zone,
	"moderation_status" varchar(20) DEFAULT 'approved',
	"moderation_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"published_at" timestamp with time zone,
	"adopted_at" timestamp with time zone,
	"adopted_by" varchar(128),
	CONSTRAINT "pets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pet_images" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"pet_id" varchar(128) NOT NULL,
	"image_url" text NOT NULL,
	"cloudinary_public_id" varchar(255),
	"thumbnail_url" text,
	"caption" varchar(255),
	"alt_text" varchar(255),
	"is_primary" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"width" integer,
	"height" integer,
	"file_size" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pet_categories" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"color" varchar(7),
	"slug" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "pet_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "pet_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pet_favorites" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"pet_id" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "shelters" ADD CONSTRAINT "shelters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_adopted_by_users_id_fk" FOREIGN KEY ("adopted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_images" ADD CONSTRAINT "pet_images_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_favorites" ADD CONSTRAINT "pet_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_favorites" ADD CONSTRAINT "pet_favorites_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pets_owner_idx" ON "pets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "pets_status_idx" ON "pets" USING btree ("adoption_status");--> statement-breakpoint
CREATE INDEX "pets_location_idx" ON "pets" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "pets_species_idx" ON "pets" USING btree ("species");--> statement-breakpoint
CREATE INDEX "pets_featured_idx" ON "pets" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "pets_active_idx" ON "pets" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "pets_created_idx" ON "pets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pet_images_pet_idx" ON "pet_images" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "pet_images_primary_idx" ON "pet_images" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "pet_favorites_user_idx" ON "pet_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pet_favorites_pet_idx" ON "pet_favorites" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "pet_favorites_unique_idx" ON "pet_favorites" USING btree ("user_id","pet_id");