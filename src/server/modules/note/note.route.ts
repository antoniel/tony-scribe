import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { match } from 'ts-pattern'
import { r2StorageService } from '../../services/r2-storage.service'
import { getSupportedFormats, isValidAudioFormat, isValidAudioSize, transcribeAudio } from '../../services/transcription.service'
import type { AppVariables } from '../../types'
import * as noteSchema from './note.schema'
import * as noteService from './note.service'

export const noteRoutes = new Hono<{ Variables: AppVariables }>()
  .get('/', zValidator('query', noteSchema.studentIdQuerySchema), async (c) => {
    const { studentId } = c.req.valid('query')

    if (studentId) {
      const result = await noteService.getNotesByPatientId(c, studentId)
      if (!result.ok) {
        throw match(result.error)
          .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
          .with({ type: 'database_error' }, () => new Error('Failed to fetch notes'))
          .with({ type: 'note_not_found' }, () => new Error('Note not found'))
          .with({ type: 'no_audio_file' }, () => new Error('Unexpected error'))
          .with({ type: 'invalid_status' }, () => new Error('Unexpected error'))
          .with({ type: 'invalid_audio_format' }, () => new Error('Unexpected error'))
          .with({ type: 'audio_too_large' }, () => new Error('Unexpected error'))
          .with({ type: 'audio_not_found' }, () => new Error('Unexpected error'))
          .with({ type: 'transcription_failed' }, () => new Error('Unexpected error'))
          .with({ type: 'no_content' }, () => new Error('Unexpected error'))
          .with({ type: 'api_error' }, () => new Error('Unexpected error'))
          .exhaustive()
      }
      return c.json(result.data)
    }

    const result = await noteService.getAllNotes(c)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'database_error' }, () => new Error('Failed to fetch notes'))
        .with({ type: 'note_not_found' }, () => new Error('Note not found'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'no_audio_file' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_status' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_audio_format' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_too_large' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_not_found' }, () => new Error('Unexpected error'))
        .with({ type: 'transcription_failed' }, () => new Error('Unexpected error'))
        .with({ type: 'no_content' }, () => new Error('Unexpected error'))
        .with({ type: 'api_error' }, () => new Error('Unexpected error'))
    }
    return c.json(result.data)
  })
  .get('/recent', async (c) => {
    const result = await noteService.getRecentNotes(c)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'database_error' }, () => new Error('Failed to fetch recent notes'))
        .with({ type: 'note_not_found' }, () => new Error('Note not found'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'no_audio_file' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_status' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_audio_format' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_too_large' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_not_found' }, () => new Error('Unexpected error'))
        .with({ type: 'transcription_failed' }, () => new Error('Unexpected error'))
        .with({ type: 'no_content' }, () => new Error('Unexpected error'))
        .with({ type: 'api_error' }, () => new Error('Unexpected error'))
        .exhaustive()
    }
    return c.json(result.data)
  })
  .get('/:id', zValidator('param', noteSchema.noteIdParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const result = await noteService.getNoteById(c, id)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'note_not_found' }, () => new Error('Note not found'))
        .with({ type: 'database_error' }, () => new Error('Failed to fetch note'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'no_audio_file' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_status' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_audio_format' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_too_large' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_not_found' }, () => new Error('Unexpected error'))
        .with({ type: 'transcription_failed' }, () => new Error('Unexpected error'))
        .with({ type: 'no_content' }, () => new Error('Unexpected error'))
        .with({ type: 'api_error' }, () => new Error('Unexpected error'))
        .exhaustive()
    }
    return c.json(result.data)
  })
  .post('/', zValidator('json', noteSchema.createNoteSchema), async (c) => {
    const validatedData = c.req.valid('json')
    const result = await noteService.createNote(c, validatedData)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'database_error' }, () => new Error('Failed to create note'))
        .with({ type: 'note_not_found' }, () => new Error('Note not found'))
        .with({ type: 'no_audio_file' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_status' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_audio_format' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_too_large' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_not_found' }, () => new Error('Unexpected error'))
        .with({ type: 'transcription_failed' }, () => new Error('Unexpected error'))
        .with({ type: 'no_content' }, () => new Error('Unexpected error'))
        .with({ type: 'api_error' }, () => new Error('Unexpected error'))
        .exhaustive()
    }
    return c.json(result.data, 201)
  })
  .put('/:id', zValidator('param', noteSchema.noteIdParamSchema), zValidator('json', noteSchema.updateNoteSchema), async (c) => {
    const { id } = c.req.valid('param')
    const validatedData = c.req.valid('json')
    const result = await noteService.updateNote(c, id, validatedData)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'note_not_found' }, () => new Error('Note not found'))
        .with({ type: 'database_error' }, () => new Error('Failed to update note'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'no_audio_file' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_status' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_audio_format' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_too_large' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_not_found' }, () => new Error('Unexpected error'))
        .with({ type: 'transcription_failed' }, () => new Error('Unexpected error'))
        .with({ type: 'no_content' }, () => new Error('Unexpected error'))
        .with({ type: 'api_error' }, () => new Error('Unexpected error'))
        .exhaustive()
    }
    return c.json(result.data)
  })
  .delete('/:id', zValidator('param', noteSchema.noteIdParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const result = await noteService.deleteNote(c, id)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'note_not_found' }, () => new Error('Note not found'))
        .with({ type: 'database_error' }, () => new Error('Failed to delete note'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'no_audio_file' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_status' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_audio_format' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_too_large' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_not_found' }, () => new Error('Unexpected error'))
        .with({ type: 'transcription_failed' }, () => new Error('Unexpected error'))
        .with({ type: 'no_content' }, () => new Error('Unexpected error'))
        .with({ type: 'api_error' }, () => new Error('Unexpected error'))
        .exhaustive()
    }
    return c.body(null, 204)
  })
  .post('/:id/generate-summary', zValidator('param', noteSchema.noteIdParamSchema), zValidator('json', noteSchema.generateSummarySchema), async (c) => {
    const { id } = c.req.valid('param')
    const { template } = c.req.valid('json')
    const result = await noteService.generateNoteSummary(c, id, template)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'note_not_found' }, () => new Error('Note not found'))
        .with({ type: 'no_content' }, () => new Error('No content available for summary generation. Please add notes or transcription.'))
        .with({ type: 'api_error' }, (e) => new Error(`Summary generation failed: ${e.error instanceof Error ? e.error.message : 'Unknown error'}`))
        .with({ type: 'database_error' }, () => new Error('Failed to generate summary'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'no_audio_file' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_status' }, () => new Error('Unexpected error'))
        .with({ type: 'invalid_audio_format' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_too_large' }, () => new Error('Unexpected error'))
        .with({ type: 'audio_not_found' }, () => new Error('Unexpected error'))
        .with({ type: 'transcription_failed' }, () => new Error('Unexpected error'))
        .exhaustive()
    }
    return c.json({ summary: result.data })
  })
  .post('/:id/transcribe', zValidator('param', noteSchema.noteIdParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const result = await noteService.transcribeNote(c, id)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'note_not_found' }, () => new Error('Note not found'))
        .with({ type: 'no_audio_file' }, () => new Error('No audio file available for transcription'))
        .with({ type: 'invalid_status' }, () => new Error('Transcription already completed'))
        .with({ type: 'invalid_audio_format' }, () => new Error(`Invalid audio format. Supported formats: ${getSupportedFormats()}`))
        .with({ type: 'audio_too_large' }, () => new Error('Audio file too large (max 25MB)'))
        .with({ type: 'audio_not_found' }, () => new Error('Audio file not found in storage'))
        .with({ type: 'transcription_failed' }, (e) => new Error(`Transcription failed: ${e.error instanceof Error ? e.error.message : 'Unknown error'}`))
        .with({ type: 'database_error' }, () => new Error('Failed to transcribe note'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'no_content' }, () => new Error('Unexpected error'))
        .with({ type: 'api_error' }, () => new Error('Unexpected error'))
        .exhaustive()
    }
    return c.json(result.data)
  })
  .post('/transcribe', async (c) => {
    try {
      const body = await c.req.parseBody()
      const audioFile = body['audio']

      if (!audioFile || typeof audioFile === 'string') {
        return c.json({ error: 'No audio file provided' }, 400)
      }

      const filename = audioFile.name || 'audio.mp3'
      if (!isValidAudioFormat(filename)) {
        return c.json(
          {
            error: 'Invalid audio format',
            supportedFormats: getSupportedFormats()
          },
          400
        )
      }

      const buffer = await audioFile.arrayBuffer()
      const audioBuffer = Buffer.from(buffer)

      if (!isValidAudioSize(audioBuffer.length)) {
        return c.json({ error: 'Audio file too large (max 25MB)' }, 400)
      }

      const audioPath = await r2StorageService.uploadAudio(audioBuffer, filename, audioFile.type)

      let transcriptionResult = null
      try {
        transcriptionResult = await transcribeAudio(audioBuffer)
      } catch (transcriptionError) {
        console.error('Transcription failed, but audio was uploaded:', transcriptionError)
        return c.json({
          error: 'Transcription failed',
          message: transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error',
          text: null,
          segments: []
        })
      }

      return c.json({
        text: transcriptionResult.text,
        segments: transcriptionResult.segments,
        audioPath
      })
    } catch (error) {
      console.error('Transcription endpoint error:', error)
      return c.json(
        {
          error: 'Failed to process audio',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      )
    }
  })
  .get('/audio/:key', async (c) => {
    try {
      const key = c.req.param('key')
      const signedUrl = await r2StorageService.getSignedUrl(decodeURIComponent(key))
      return c.json({ url: signedUrl })
    } catch (error) {
      console.error('Failed to get audio:', error)
      return c.json({ error: 'Failed to retrieve audio' }, 500)
    }
  })
