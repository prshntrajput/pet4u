CREATE TABLE "adoption_requests" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"pet_id" varchar(128) NOT NULL,
	"adopter_id" varchar(128) NOT NULL,
	"shelter_id" varchar(128) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"response_message" text,
	"responded_at" timestamp with time zone,
	"meeting_scheduled" boolean DEFAULT false,
	"meeting_date" timestamp with time zone,
	"meeting_location" text,
	"meeting_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"sender_id" varchar(128) NOT NULL,
	"receiver_id" varchar(128) NOT NULL,
	"adoption_request_id" varchar(128),
	"content" text NOT NULL,
	"message_type" varchar(20) DEFAULT 'text' NOT NULL,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user1_id" varchar(128) NOT NULL,
	"user2_id" varchar(128) NOT NULL,
	"last_message_id" varchar(128),
	"last_message_content" text,
	"last_message_at" timestamp with time zone,
	"user1_unread_count" integer DEFAULT 0,
	"user2_unread_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"related_id" varchar(128),
	"related_type" varchar(50),
	"action_url" varchar(500),
	"is_read" boolean DEFAULT false,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_adopter_id_users_id_fk" FOREIGN KEY ("adopter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_shelter_id_users_id_fk" FOREIGN KEY ("shelter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_adoption_request_id_adoption_requests_id_fk" FOREIGN KEY ("adoption_request_id") REFERENCES "public"."adoption_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adoption_requests_pet_idx" ON "adoption_requests" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "adoption_requests_adopter_idx" ON "adoption_requests" USING btree ("adopter_id");--> statement-breakpoint
CREATE INDEX "adoption_requests_shelter_idx" ON "adoption_requests" USING btree ("shelter_id");--> statement-breakpoint
CREATE INDEX "adoption_requests_status_idx" ON "adoption_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "adoption_requests_created_idx" ON "adoption_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_receiver_idx" ON "messages" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "messages_request_idx" ON "messages" USING btree ("adoption_request_id");--> statement-breakpoint
CREATE INDEX "messages_created_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "conversations_user1_idx" ON "conversations" USING btree ("user1_id");--> statement-breakpoint
CREATE INDEX "conversations_user2_idx" ON "conversations" USING btree ("user2_id");--> statement-breakpoint
CREATE INDEX "conversations_updated_idx" ON "conversations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_idx" ON "notifications" USING btree ("created_at");