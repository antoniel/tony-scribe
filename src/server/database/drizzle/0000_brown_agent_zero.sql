CREATE TYPE "public"."transcription_source" AS ENUM('text', 'audio');--> statement-breakpoint
CREATE TYPE "public"."transcription_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(255),
	"student_id" text NOT NULL,
	"raw_content" text NOT NULL,
	"transcription_text" text,
	"ai_summary" text,
	"audio_path" varchar(255),
	"transcription_status" "transcription_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(255) NOT NULL,
	"enrollment_date" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notes_student_id_idx" ON "notes" USING btree ("student_id");