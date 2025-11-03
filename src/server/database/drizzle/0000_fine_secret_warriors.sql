CREATE TYPE "public"."transcription_source" AS ENUM('text', 'audio');--> statement-breakpoint
CREATE TYPE "public"."transcription_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"patient_id" text NOT NULL,
	"raw_content" text NOT NULL,
	"ai_summary" text,
	"audio_path" varchar(255),
	"transcription_source" "transcription_source" DEFAULT 'text' NOT NULL,
	"transcription_status" "transcription_status" DEFAULT 'completed' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(255) NOT NULL,
	"date_of_birth" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notes_patient_id_idx" ON "notes" USING btree ("patient_id");