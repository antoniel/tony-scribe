import { count, desc, eq, sql } from 'drizzle-orm'
import type { Context } from 'hono'
import type { z } from 'zod'
import { Notes, Patients } from '../../database/schema'
import type { AppResult } from '../../result'
import { err, ok } from '../../result'
import type { AppVariables } from '../../types'
import type { createPatientSchema, updatePatientSchema } from './patient.schema'

type PatientError = { type: 'database_error'; error: unknown } | { type: 'patient_not_found' }

export interface PatientWithNoteStats {
  id: string
  name: string
  dateOfBirth: Date
  createdAt: Date
  updatedAt: Date
  notesCount: number
  lastNoteDate: Date | null
}

export const getPatientsWithStats = async (c: Context<{ Variables: AppVariables }>): Promise<AppResult<PatientWithNoteStats[], PatientError>> => {
  const dbInstance = c.get('db')
  try {
    const results = await dbInstance
      .select({
        id: Patients.id,
        name: Patients.name,
        dateOfBirth: Patients.dateOfBirth,
        createdAt: Patients.createdAt,
        updatedAt: Patients.updatedAt,
        notesCount: count(Notes.id),
        lastNoteDate: sql<Date | null>`max(${Notes.createdAt})`
      })
      .from(Patients)
      .leftJoin(Notes, eq(Patients.id, Notes.patientId))
      .groupBy(Patients.id, Patients.name, Patients.dateOfBirth, Patients.createdAt, Patients.updatedAt)
      .orderBy(desc(sql`max(${Notes.createdAt})`))

    return ok(results as PatientWithNoteStats[])
  } catch (error) {
    console.error('Error fetching patients with stats:', error)
    return err({ type: 'database_error', error })
  }
}

export const getAllPatients = async (c: Context<{ Variables: AppVariables }>): Promise<AppResult<Array<typeof Patients.$inferSelect>, PatientError>> => {
  const dbInstance = c.get('db')
  try {
    const allPatients = await dbInstance.select().from(Patients).orderBy(Patients.name)
    return ok(allPatients)
  } catch (error) {
    console.error('Error fetching all patients:', error)
    return err({ type: 'database_error', error })
  }
}

export const getRecentPatients = async (c: Context<{ Variables: AppVariables }>): Promise<AppResult<Array<typeof Patients.$inferSelect>, PatientError>> => {
  const dbInstance = c.get('db')
  try {
    const recentPatients = await dbInstance.select().from(Patients).orderBy(desc(Patients.updatedAt)).limit(5)
    return ok(recentPatients)
  } catch (error) {
    console.error('Error fetching recent patients:', error)
    return err({ type: 'database_error', error })
  }
}

export const getPatientById = async (c: Context<{ Variables: AppVariables }>, id: string): Promise<AppResult<typeof Patients.$inferSelect, PatientError>> => {
  const dbInstance = c.get('db')
  try {
    const [patient] = await dbInstance.select().from(Patients).where(eq(Patients.id, id))

    if (patient === undefined) {
      return err({ type: 'patient_not_found' })
    }

    return ok(patient)
  } catch (error) {
    console.error(`Error fetching patient with ID ${id}:`, error)
    return err({ type: 'database_error', error })
  }
}

type CreatePatientInput = z.infer<typeof createPatientSchema>

export const createPatient = async (
  c: Context<{ Variables: AppVariables }>,
  patientData: CreatePatientInput
): Promise<AppResult<typeof Patients.$inferSelect, PatientError>> => {
  const dbInstance = c.get('db')

  try {
    const now = new Date()
    const [newPatient] = await dbInstance
      .insert(Patients)
      .values({
        name: patientData.name.trim(),
        dateOfBirth: new Date(patientData.dateOfBirth),
        createdAt: now,
        updatedAt: now
      })
      .returning()

    if (!newPatient) {
      return err({ type: 'database_error', error: 'Insert operation did not return expected data' })
    }

    return ok(newPatient)
  } catch (error) {
    console.error('Database error during patient creation:', error)
    return err({ type: 'database_error', error })
  }
}

type UpdatePatientInput = z.infer<typeof updatePatientSchema>

export const updatePatient = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  updateData: UpdatePatientInput
): Promise<AppResult<typeof Patients.$inferSelect, PatientError>> => {
  const dbInstance = c.get('db')

  try {
    const patientCheck = await dbInstance.select({ id: Patients.id }).from(Patients).where(eq(Patients.id, id))

    if (patientCheck.length === 0) {
      return err({ type: 'patient_not_found' })
    }

    const updateValues: any = { updatedAt: new Date() }
    if (updateData.name) updateValues.name = updateData.name.trim()
    if (updateData.dateOfBirth) updateValues.dateOfBirth = new Date(updateData.dateOfBirth)

    const [updatedPatient] = await dbInstance.update(Patients).set(updateValues).where(eq(Patients.id, id)).returning()

    if (!updatedPatient) {
      return err({ type: 'patient_not_found' })
    }

    return ok(updatedPatient)
  } catch (error) {
    console.error(`Error updating patient with ID ${id}:`, error)
    return err({ type: 'database_error', error })
  }
}

export const deletePatient = async (c: Context<{ Variables: AppVariables }>, id: string): Promise<AppResult<void, PatientError>> => {
  const dbInstance = c.get('db')

  try {
    const patientCheck = await dbInstance.select({ id: Patients.id }).from(Patients).where(eq(Patients.id, id))

    if (patientCheck.length === 0) {
      return err({ type: 'patient_not_found' })
    }

    await dbInstance.delete(Patients).where(eq(Patients.id, id))

    return ok(undefined)
  } catch (error) {
    console.error(`Error deleting patient with ID ${id}:`, error)
    return err({ type: 'database_error', error })
  }
}
