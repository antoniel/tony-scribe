import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { Notes } from '../../database/schema'

export const createNoteDTOSchema = createInsertSchema(Notes)
export type CreateNoteDTO = z.infer<typeof createNoteDTOSchema>

export const updateNoteDTOSchema = createNoteDTOSchema.omit({ patientId: true }).partial()
export type UpdateNoteDTO = z.infer<typeof updateNoteDTOSchema>

export const selectNoteDTOSchema = createSelectSchema(Notes)
export type NoteDTO = z.infer<typeof selectNoteDTOSchema>

export const noteWithPatientDTOSchema = selectNoteDTOSchema.extend({
  patientName: z.string(),
  patientDOB: z.date().optional()
})
export type NoteWithPatientDTO = z.infer<typeof noteWithPatientDTOSchema>

export const noteDetailDTOSchema = noteWithPatientDTOSchema
export type NoteDetailDTO = z.infer<typeof noteDetailDTOSchema>

export const noteListItemDTOSchema = selectNoteDTOSchema
  .pick({
    id: true,
    name: true,
    patientId: true,
    rawContent: true,
    aiSummary: true,
    transcriptionSource: true,
    transcriptionStatus: true,
    createdAt: true
  })
  .extend({
    patientName: z.string()
  })
export type NoteListItemDTO = z.infer<typeof noteListItemDTOSchema>
