import { client } from '@/lib/api-client'
import type { SummaryTemplateId } from '@/lib/summary-templates'
import type { UpdateNoteDTO } from '@/server/modules/note/note.model'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType } from 'hono/client'
import { JSONParsed } from 'hono/utils/types'

export function useNotes(patientId?: string) {
  return useQuery({
    queryKey: patientId ? ['notes', patientId] : ['notes'],
    queryFn: async () => {
      const res = await client.api.notes.$get(patientId ? { query: { patientId: patientId } } : { query: {} })
      return res.json()
    }
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ['notes', id],
    queryFn: async () => {
      const res = await client.api.notes[':id'].$get({ param: { id } })
      return res.json()
    },
    enabled: !!id
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InferRequestType<typeof client.api.notes.$post>['json']) => {
      const res = await client.api.notes.$post({ json: data })
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes', variables.patientId] })
    }
  })
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: JSONParsed<UpdateNoteDTO>) => {
      const res = await client.api.notes[':id'].$put({
        param: { id },
        json: {
          rawContent: data.rawContent,
          aiSummary: data.aiSummary ?? undefined,
          audioPath: data.audioPath !== undefined ? (data.audioPath === null ? null : data.audioPath) : undefined,
          transcriptionStatus: data.transcriptionStatus as 'completed' | 'pending' | 'failed' | undefined,
          transcriptionText: data.transcriptionText ?? undefined
        }
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes', id] })
    }
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.api.notes[':id'].$delete({ param: { id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

export function useTranscribeNote(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await client.api.notes[':id'].transcribe.$post({ param: { id: noteId } })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes', noteId] })
    }
  })
}

export function useGenerateSummary(noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (template: SummaryTemplateId) => {
      const res = await client.api.notes[':id']['generate-summary'].$post({
        param: { id: noteId },
        json: { template }
      })
      const data = await res.json()
      return data.summary as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes', noteId] })
    }
  })
}
