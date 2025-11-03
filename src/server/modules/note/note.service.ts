import { desc, eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { Notes, Patients } from '../../database/schema'
import type { AppResult } from '../../result'
import { err, ok } from '../../result'
import { formatSoapAsText, generateSoapSummary, generateSummary, type SummaryTemplate } from '../../services/ai.service'
import { r2StorageService } from '../../services/r2-storage.service'
import { isValidAudioFormat, isValidAudioSize, transcribeAudio } from '../../services/transcription.service'
import type { AppVariables } from '../../types'
import type { CreateNoteInput, UpdateNoteInput } from './note.schema'

type NoteError =
  | { type: 'database_error'; error: unknown }
  | { type: 'note_not_found' }
  | { type: 'patient_not_found' }
  | { type: 'no_audio_file' }
  | { type: 'invalid_status' }
  | { type: 'invalid_audio_format' }
  | { type: 'audio_too_large' }
  | { type: 'audio_not_found' }
  | { type: 'transcription_failed'; error: unknown }
  | { type: 'no_content' }
  | { type: 'api_error'; error: unknown }

export const getAllNotes = async (
  c: Context<{ Variables: AppVariables }>
): Promise<AppResult<(typeof Notes.$inferSelect & { patientName: string })[], NoteError>> => {
  const dbInstance = c.get('db')
  try {
    const allNotes = await dbInstance
      .select({
        id: Notes.id,
        name: Notes.name,
        patientId: Notes.patientId,
        rawContent: Notes.rawContent,
        transcriptionText: Notes.transcriptionText,
        aiSummary: Notes.aiSummary,
        audioPath: Notes.audioPath,
        transcriptionStatus: Notes.transcriptionStatus,
        createdAt: Notes.createdAt,
        updatedAt: Notes.updatedAt,
        patientName: Patients.name
      })
      .from(Notes)
      .innerJoin(Patients, eq(Notes.patientId, Patients.id))
      .orderBy(desc(Notes.createdAt))

    return ok(allNotes as any)
  } catch (error) {
    console.error('Error fetching all notes:', error)
    return err({ type: 'database_error', error })
  }
}

export const getRecentNotes = async (
  c: Context<{ Variables: AppVariables }>
): Promise<AppResult<(typeof Notes.$inferSelect & { patientName: string })[], NoteError>> => {
  const dbInstance = c.get('db')
  try {
    const recentNotes = await dbInstance
      .select({
        id: Notes.id,
        name: Notes.name,
        patientId: Notes.patientId,
        rawContent: Notes.rawContent,
        transcriptionText: Notes.transcriptionText,
        aiSummary: Notes.aiSummary,
        audioPath: Notes.audioPath,
        transcriptionStatus: Notes.transcriptionStatus,
        createdAt: Notes.createdAt,
        updatedAt: Notes.updatedAt,
        patientName: Patients.name
      })
      .from(Notes)
      .innerJoin(Patients, eq(Notes.patientId, Patients.id))
      .orderBy(desc(Notes.createdAt))
      .limit(5)

    return ok(recentNotes as any)
  } catch (error) {
    console.error('Error fetching recent notes:', error)
    return err({ type: 'database_error', error })
  }
}

export const getNotesByPatientId = async (
  c: Context<{ Variables: AppVariables }>,
  patientId: string
): Promise<AppResult<(typeof Notes.$inferSelect)[], NoteError>> => {
  const dbInstance = c.get('db')
  try {
    const [patient] = await dbInstance.select({ id: Patients.id }).from(Patients).where(eq(Patients.id, patientId))

    if (!patient) {
      return err({ type: 'patient_not_found' })
    }

    const patientNotes = await dbInstance.select().from(Notes).where(eq(Notes.patientId, patientId)).orderBy(desc(Notes.createdAt))

    return ok(patientNotes)
  } catch (error) {
    console.error(`Error fetching notes for patient ${patientId}:`, error)
    return err({ type: 'database_error', error })
  }
}

export const getNoteById = async (
  c: Context<{ Variables: AppVariables }>,
  id: string
): Promise<AppResult<typeof Notes.$inferSelect & { patientName: string; patientDOB: Date }, NoteError>> => {
  const dbInstance = c.get('db')
  try {
    const [note] = await dbInstance
      .select({
        id: Notes.id,
        name: Notes.name,
        patientId: Notes.patientId,
        rawContent: Notes.rawContent,
        transcriptionText: Notes.transcriptionText,
        aiSummary: Notes.aiSummary,
        audioPath: Notes.audioPath,
        transcriptionStatus: Notes.transcriptionStatus,
        createdAt: Notes.createdAt,
        updatedAt: Notes.updatedAt,
        patientName: Patients.name,
        patientDOB: Patients.dateOfBirth
      })
      .from(Notes)
      .innerJoin(Patients, eq(Notes.patientId, Patients.id))
      .where(eq(Notes.id, id))

    if (!note) {
      return err({ type: 'note_not_found' })
    }

    return ok(note as any)
  } catch (error) {
    console.error(`Error fetching note with ID ${id}:`, error)
    return err({ type: 'database_error', error })
  }
}

export const createNote = async (
  c: Context<{ Variables: AppVariables }>,
  noteData: CreateNoteInput
): Promise<AppResult<typeof Notes.$inferSelect, NoteError>> => {
  const dbInstance = c.get('db')

  try {
    const [patient] = await dbInstance.select({ id: Patients.id, name: Patients.name }).from(Patients).where(eq(Patients.id, noteData.patientId))

    if (!patient) {
      return err({ type: 'patient_not_found' })
    }

    let aiSummary = noteData.aiSummary
    if (!aiSummary && noteData.rawContent.trim()) {
      try {
        const soapNote = await generateSoapSummary(noteData.rawContent)
        aiSummary = formatSoapAsText(soapNote)
      } catch (aiError) {
        console.error('AI summarization failed, continuing without summary:', aiError)
        aiSummary = null
      }
    }

    const now = new Date()
    const defaultName = `Note - ${patient.name} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    const [newNote] = await dbInstance
      .insert(Notes)
      .values({
        name: noteData.name || defaultName,
        patientId: noteData.patientId,
        rawContent: noteData.rawContent.trim(),
        transcriptionText: noteData.transcriptionText ? noteData.transcriptionText.trim() : null,
        aiSummary: aiSummary ? aiSummary.trim() : null,
        audioPath: noteData.audioPath ? noteData.audioPath.trim() : null,
        transcriptionStatus: noteData.transcriptionStatus,
        createdAt: now,
        updatedAt: now
      })
      .returning()

    if (!newNote) {
      return err({ type: 'database_error', error: 'Insert operation did not return expected data' })
    }

    return ok(newNote)
  } catch (error) {
    console.error('Database error during note creation:', error)
    return err({ type: 'database_error', error })
  }
}

export const updateNote = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  updateData: UpdateNoteInput
): Promise<AppResult<typeof Notes.$inferSelect, NoteError>> => {
  const dbInstance = c.get('db')

  try {
    const noteCheck = await dbInstance.select({ id: Notes.id }).from(Notes).where(eq(Notes.id, id))

    if (noteCheck.length === 0) {
      return err({ type: 'note_not_found' })
    }

    const updateValues: any = { updatedAt: new Date() }
    if (updateData.name !== undefined) updateValues.name = updateData.name?.trim() || null
    if (updateData.rawContent) updateValues.rawContent = updateData.rawContent.trim()
    if (updateData.transcriptionText !== undefined) updateValues.transcriptionText = updateData.transcriptionText ? updateData.transcriptionText.trim() : null
    if (updateData.aiSummary) updateValues.aiSummary = updateData.aiSummary.trim()
    if (updateData.audioPath !== undefined) updateValues.audioPath = updateData.audioPath ? updateData.audioPath.trim() : null
    if (updateData.transcriptionStatus) updateValues.transcriptionStatus = updateData.transcriptionStatus

    const [updatedNote] = await dbInstance.update(Notes).set(updateValues).where(eq(Notes.id, id)).returning()

    if (!updatedNote) {
      return err({ type: 'note_not_found' })
    }

    return ok(updatedNote)
  } catch (error) {
    console.error(`Error updating note with ID ${id}:`, error)
    return err({ type: 'database_error', error })
  }
}

export const deleteNote = async (c: Context<{ Variables: AppVariables }>, id: string): Promise<AppResult<void, NoteError>> => {
  const dbInstance = c.get('db')

  try {
    const noteCheck = await dbInstance.select({ id: Notes.id }).from(Notes).where(eq(Notes.id, id))

    if (noteCheck.length === 0) {
      return err({ type: 'note_not_found' })
    }

    await dbInstance.delete(Notes).where(eq(Notes.id, id))

    return ok(undefined)
  } catch (error) {
    console.error(`Error deleting note with ID ${id}:`, error)
    return err({ type: 'database_error', error })
  }
}

export const transcribeNote = async (c: Context<{ Variables: AppVariables }>, id: string): Promise<AppResult<typeof Notes.$inferSelect, NoteError>> => {
  const dbInstance = c.get('db')

  try {
    const [note] = await dbInstance.select().from(Notes).where(eq(Notes.id, id))

    if (!note) {
      return err({ type: 'note_not_found' })
    }

    if (!note.audioPath) {
      return err({ type: 'no_audio_file' })
    }

    if (note.transcriptionStatus === 'completed') {
      return err({ type: 'invalid_status' })
    }

    try {
      let audioBuffer: Buffer
      try {
        audioBuffer = await r2StorageService.getAudioBuffer(note.audioPath)
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return err({ type: 'audio_not_found' })
        }
        throw error
      }

      if (!isValidAudioFormat(note.audioPath)) {
        await dbInstance.update(Notes).set({ transcriptionStatus: 'failed', updatedAt: new Date() }).where(eq(Notes.id, id))
        return err({ type: 'invalid_audio_format' })
      }

      if (!isValidAudioSize(audioBuffer.length)) {
        await dbInstance.update(Notes).set({ transcriptionStatus: 'failed', updatedAt: new Date() }).where(eq(Notes.id, id))
        return err({ type: 'audio_too_large' })
      }

      const transcriptionResult = await transcribeAudio(audioBuffer)

      const [updatedNote] = await dbInstance
        .update(Notes)
        .set({
          transcriptionText: transcriptionResult.text,
          transcriptionStatus: 'completed',
          updatedAt: new Date()
        })
        .where(eq(Notes.id, id))
        .returning()

      if (!updatedNote) {
        return err({ type: 'note_not_found' })
      }

      return ok(updatedNote)
    } catch (error) {
      console.error(`Transcription error for note ${id}:`, error)

      try {
        await dbInstance.update(Notes).set({ transcriptionStatus: 'failed', updatedAt: new Date() }).where(eq(Notes.id, id))
      } catch (updateError) {
        console.error(`Failed to update note status to failed:`, updateError)
      }

      return err({ type: 'transcription_failed', error })
    }
  } catch (error) {
    console.error(`Error transcribing note with ID ${id}:`, error)
    return err({ type: 'database_error', error })
  }
}

export const generateNoteSummary = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  template: SummaryTemplate
): Promise<AppResult<string, NoteError>> => {
  const dbInstance = c.get('db')

  try {
    const [note] = await dbInstance.select().from(Notes).where(eq(Notes.id, id))

    if (!note) {
      return err({ type: 'note_not_found' })
    }

    const hasTranscription = note.transcriptionText && note.transcriptionText.trim().length > 0
    const hasNotes = note.rawContent && note.rawContent.trim().length > 0

    if (!hasTranscription && !hasNotes) {
      return err({ type: 'no_content' })
    }

    const content = `[Transcription]\n${note.transcriptionText!}\n\n[Notes]\n${note.rawContent!}`

    if (!content || content.trim().length === 0) {
      return err({ type: 'no_content' })
    }

    try {
      const summary = await generateSummary(content, template)
      return ok(summary)
    } catch (error) {
      console.error(`Error generating summary for note ${id}:`, error)
      return err({ type: 'api_error', error })
    }
  } catch (error) {
    console.error(`Error in generateNoteSummary for note ${id}:`, error)
    return err({ type: 'database_error', error })
  }
}
