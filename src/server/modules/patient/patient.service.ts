import { count, desc, eq, sql } from 'drizzle-orm'
import type { Context } from 'hono'
import type { z } from 'zod'
import { Notes, Students } from '../../database/schema'
import type { AppResult } from '../../result'
import { err, ok } from '../../result'
import type { AppVariables } from '../../types'
import type { createPatientSchema, updatePatientSchema } from './patient.schema'

type PatientError = { type: 'database_error'; error: unknown } | { type: 'patient_not_found' }

export interface PatientWithNoteStats {
  id: string
  name: string
  enrollmentDate: Date
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
        id: Students.id,
        name: Students.name,
        enrollmentDate: Students.enrollmentDate,
        createdAt: Students.createdAt,
        updatedAt: Students.updatedAt,
        notesCount: count(Notes.id),
        lastNoteDate: sql<Date | null>`max(${Notes.createdAt})`
      })
      .from(Students)
      .leftJoin(Notes, eq(Students.id, Notes.studentId))
      .groupBy(Students.id, Students.name, Students.enrollmentDate, Students.createdAt, Students.updatedAt)
      .orderBy(desc(sql`max(${Notes.createdAt})`))

    return ok(results as PatientWithNoteStats[])
  } catch (error) {
    console.error('Error fetching patients with stats:', error)
    return err({ type: 'database_error', error })
  }
}

export const getAllPatients = async (c: Context<{ Variables: AppVariables }>): Promise<AppResult<Array<typeof Students.$inferSelect>, PatientError>> => {
  const dbInstance = c.get('db')
  try {
    const allPatients = await dbInstance.select().from(Students).orderBy(Students.name)
    return ok(allPatients)
  } catch (error) {
    console.error('Error fetching all patients:', error)
    return err({ type: 'database_error', error })
  }
}

export const getRecentPatients = async (c: Context<{ Variables: AppVariables }>): Promise<AppResult<Array<typeof Students.$inferSelect>, PatientError>> => {
  const dbInstance = c.get('db')
  try {
    const recentPatients = await dbInstance.select().from(Students).orderBy(desc(Students.updatedAt)).limit(5)
    return ok(recentPatients)
  } catch (error) {
    console.error('Error fetching recent patients:', error)
    return err({ type: 'database_error', error })
  }
}

export const getPatientById = async (c: Context<{ Variables: AppVariables }>, id: string): Promise<AppResult<typeof Students.$inferSelect, PatientError>> => {
  const dbInstance = c.get('db')
  try {
    const [patient] = await dbInstance.select().from(Students).where(eq(Students.id, id))

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
): Promise<AppResult<typeof Students.$inferSelect, PatientError>> => {
  const dbInstance = c.get('db')

  try {
    const now = new Date()
    const [newPatient] = await dbInstance
      .insert(Students)
      .values({
        name: patientData.name.trim(),
        enrollmentDate: new Date(patientData.enrollmentDate),
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
): Promise<AppResult<typeof Students.$inferSelect, PatientError>> => {
  const dbInstance = c.get('db')

  try {
    const patientCheck = await dbInstance.select({ id: Students.id }).from(Students).where(eq(Students.id, id))

    if (patientCheck.length === 0) {
      return err({ type: 'patient_not_found' })
    }

    const updateValues: any = { updatedAt: new Date() }
    if (updateData.name) updateValues.name = updateData.name.trim()
    if (updateData.enrollmentDate) updateValues.enrollmentDate = new Date(updateData.enrollmentDate)

    const [updatedPatient] = await dbInstance.update(Students).set(updateValues).where(eq(Students.id, id)).returning()

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
    const patientCheck = await dbInstance.select({ id: Students.id }).from(Students).where(eq(Students.id, id))

    if (patientCheck.length === 0) {
      return err({ type: 'patient_not_found' })
    }

    await dbInstance.delete(Students).where(eq(Students.id, id))

    return ok(undefined)
  } catch (error) {
    console.error(`Error deleting patient with ID ${id}:`, error)
    return err({ type: 'database_error', error })
  }
}
