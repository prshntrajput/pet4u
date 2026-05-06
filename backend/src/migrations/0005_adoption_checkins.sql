CREATE TABLE "adoption_check_ins" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"adoption_request_id" varchar(128) NOT NULL,
	"pet_id" varchar(128) NOT NULL,
	"adopter_id" varchar(128) NOT NULL,
	"shelter_id" varchar(128) NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"check_in_type" varchar(20) NOT NULL,
	"overall_wellbeing" varchar(20),
	"weight" varchar(50),
	"is_eating_well" boolean,
	"is_active" boolean,
	"vet_visited" boolean DEFAULT false,
	"concerns" text,
	"happy_moments" text,
	"photo_url" varchar(500),
	"shelter_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "adoption_check_ins" ADD CONSTRAINT "adoption_check_ins_adoption_request_id_fk" FOREIGN KEY ("adoption_request_id") REFERENCES "public"."adoption_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_check_ins" ADD CONSTRAINT "adoption_check_ins_pet_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_check_ins" ADD CONSTRAINT "adoption_check_ins_adopter_id_fk" FOREIGN KEY ("adopter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_check_ins" ADD CONSTRAINT "adoption_check_ins_shelter_id_fk" FOREIGN KEY ("shelter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checkins_request_idx" ON "adoption_check_ins" USING btree ("adoption_request_id");--> statement-breakpoint
CREATE INDEX "checkins_adopter_idx" ON "adoption_check_ins" USING btree ("adopter_id");--> statement-breakpoint
CREATE INDEX "checkins_shelter_idx" ON "adoption_check_ins" USING btree ("shelter_id");--> statement-breakpoint
CREATE INDEX "checkins_status_idx" ON "adoption_check_ins" USING btree ("status");
