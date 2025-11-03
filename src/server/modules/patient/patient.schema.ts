import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { Patients } from '../../database/schema'

export const createPatientSchema = createInsertSchema(Patients)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    name: z.string().min(1, 'Patient name is required').max(255),
    dateOfBirth: z.string().date('Invalid date format')
  })

export const updatePatientSchema = createPatientSchema.partial()

export const patientIdParamSchema = z.object({ id: z.string() })

export const selectPatientSchema = createSelectSchema(Patients)
