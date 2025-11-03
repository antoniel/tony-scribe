ALTER TABLE "notes" ALTER COLUMN "transcription_status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "transcription_text" text;--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN "transcription_source";