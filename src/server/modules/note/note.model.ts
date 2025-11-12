import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { Notes } from '../../database/schema'

export const createNoteDTOSchema = createInsertSchema(Notes)
export type CreateNoteDTO = z.infer<typeof createNoteDTOSchema>

export const updateNoteDTOSchema = createNoteDTOSchema.omit({ studentId: true }).partial()
export type UpdateNoteDTO = z.infer<typeof updateNoteDTOSchema>

export const selectNoteDTOSchema = createSelectSchema(Notes)
export type NoteDTO = z.infer<typeof selectNoteDTOSchema>

export const noteWithPatientDTOSchema = selectNoteDTOSchema.extend({
  studentName: z.string(),
  studentEnrollmentDate: z.date().optional()
})
export type NoteWithPatientDTO = z.infer<typeof noteWithPatientDTOSchema>

export const noteDetailDTOSchema = noteWithPatientDTOSchema
export type NoteDetailDTO = z.infer<typeof noteDetailDTOSchema>

export const noteListItemDTOSchema = selectNoteDTOSchema
  .pick({
    id: true,
    name: true,
    studentId: true,
    rawContent: true,
    aiSummary: true,
    transcriptionStatus: true,
    createdAt: true
  })
  .extend({
    studentName: z.string()
  })
export type NoteListItemDTO = z.infer<typeof noteListItemDTOSchema>
