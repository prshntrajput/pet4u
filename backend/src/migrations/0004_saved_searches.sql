CREATE TABLE "saved_searches" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"name" varchar(255) NOT NULL,
	"species" varchar(50),
	"breed" varchar(100),
	"gender" varchar(20),
	"size" varchar(30),
	"city" varchar(100),
	"state" varchar(100),
	"min_age" integer,
	"max_age" integer,
	"is_active" boolean DEFAULT true,
	"last_notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saved_searches_user_idx" ON "saved_searches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_searches_active_idx" ON "saved_searches" USING btree ("is_active");
