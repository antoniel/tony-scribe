import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { Patients } from '../../database/schema'

export const createPatientDTOSchema = createInsertSchema(Patients)
export type CreatePatientDTO = z.infer<typeof createPatientDTOSchema>

export const updatePatientDTOSchema = createPatientDTOSchema.partial()
export type UpdatePatientDTO = z.infer<typeof updatePatientDTOSchema>

export const selectPatientDTOSchema = createSelectSchema(Patients)
export type PatientDTO = z.infer<typeof selectPatientDTOSchema>

export const patientListItemDTOSchema = selectPatientDTOSchema.pick({
  id: true,
  name: true,
  dateOfBirth: true,
  patientId: true,
  createdAt: true
})
export type PatientListItemDTO = z.infer<typeof patientListItemDTOSchema>
