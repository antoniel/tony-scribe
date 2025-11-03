import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { Notes } from '../../database/schema'

export const createNoteSchema = createInsertSchema(Notes, {
  rawContent: z.string().default(''),
  transcriptionText: z.string().optional().nullable(),
  aiSummary: z.string().optional().nullable(),
  audioPath: z.string().optional().nullable()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const updateNoteSchema = createNoteSchema.omit({ patientId: true }).partial()

export const noteIdParamSchema = z.object({ id: z.string() })

export const patientIdQuerySchema = z.object({ patientId: z.string().optional() })

export const selectNoteSchema = createSelectSchema(Notes)

export const generateSummarySchema = z.object({
  template: z.enum(['soap', 'progress', 'discharge'])
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>
