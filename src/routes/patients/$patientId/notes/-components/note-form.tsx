import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useCreateNote, useNote, useUpdateNote } from '@/hooks'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown, Copy, Loader, Mic } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AudioRecorder } from './audio-recorder'
import { SummarySection } from './summary-section'
import { TiptapEditor } from './tiptap-editor'

interface NoteFormProps {
  noteId?: string
  patientId: string
  generatedSummary?: string | null
  showOnlyNotes?: boolean
  editorContent?: string
  setEditorContent?: (content: string) => void
}

export function NoteForm({
  noteId,
  patientId,
  generatedSummary,
  showOnlyNotes = false,
  editorContent: externalEditorContent,
  setEditorContent: externalSetEditorContent
}: NoteFormProps) {
  const navigate = useNavigate()
  const { data: existingNote, isLoading: isLoadingNote } = useNote(noteId || '')
  const createMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote(noteId || '')

  const transcribeAudioMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('audio', file)

      const response = await fetch('/api/notes/transcribe', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok && !data.audioPath) {
        throw new Error(data.error || 'Failed to upload audio')
      }

      return data
    }
  })

  const [internalEditorContent, setInternalEditorContent] = useState('')
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(!!existingNote?.audioPath)

  const hasInitializedRef = useRef(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isEditMode = !!noteId
  const mutation = isEditMode ? updateNoteMutation : createMutation
  const isPending = mutation.isPending || (isEditMode && isLoadingNote)
  const editorContent = externalEditorContent ?? internalEditorContent
  const showTranscriptionSection = existingNote?.transcriptionText || existingNote?.audioPath
  const transcriptionStatus = existingNote?.transcriptionStatus
  const showSummarySection = existingNote?.aiSummary || generatedSummary || (existingNote && (existingNote.transcriptionText || existingNote.rawContent))
  const setEditorContent = externalSetEditorContent ?? setInternalEditorContent

  useEffect(() => {
    if (isEditMode && existingNote?.rawContent && !hasInitializedRef.current) {
      const content = existingNote.rawContent
      setEditorContent(content)
      hasInitializedRef.current = true
    }
  }, [isEditMode, existingNote?.rawContent])

  useEffect(() => {
    setIsAudioRecorderOpen(!!existingNote?.audioPath || transcribeAudioMutation.isPending)
  }, [existingNote?.audioPath, transcribeAudioMutation.isPending])

  const handleCopyToNotes = () => {
    if (existingNote?.transcriptionText) {
      const currentNotes = editorContent.trim()
      const transcription = existingNote.transcriptionText.trim()
      const transcriptionHtml = transcription
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => `<p>${line.trim()}</p>`)
        .join('')

      if (currentNotes) {
        setEditorContent(`${currentNotes}<br><br>${transcriptionHtml}`)
      } else {
        setEditorContent(transcriptionHtml)
      }
    }
  }

  const handleSaveSummary = (summary: string) => {
    if (noteId) {
      updateNoteMutation.mutate({
        id: noteId,
        aiSummary: summary
      })
    }
  }

  const handleRegenerateSummary = () => {}

  const handleAudioDelete = () => {
    if (isEditMode && noteId) {
      updateNoteMutation.mutate({
        id: noteId,
        audioPath: null,
        transcriptionStatus: 'pending' as const
      })
    }
  }

  const handleAudioFile = (file: File) => {
    transcribeAudioMutation.mutate(file, {
      onSuccess: (data) => {
        const audioPath = data.audioPath
        if (!audioPath) {
          return
        }

        if (isEditMode && noteId) {
          return updateNoteMutation.mutate({
            id: noteId,
            audioPath,
            transcriptionStatus: 'pending' as const
          })
        }

        return createMutation.mutate({
          patientId: patientId,
          rawContent: editorContent.trim(),
          audioPath,
          transcriptionStatus: 'pending' as const
        })
      },
      onError: (error) => {
        console.error('Error uploading audio:', error)
        alert(error instanceof Error ? error.message : 'Failed to upload audio')
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const contentToSave = editorContent.trim()

    if (isEditMode) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      updateNoteMutation.mutate({
        id: noteId,
        rawContent: contentToSave
      })
    } else {
      createMutation.mutate({
        patientId: patientId,
        rawContent: contentToSave
      })
    }
  }

  return (
    <>
      {isPending && !hasInitializedRef.current ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notes</CardTitle>
                {mutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <TiptapEditor content={editorContent} onChange={setEditorContent} editable={!isPending} />
            </CardContent>
          </Card>

          {showOnlyNotes && <>{mutation.error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">{mutation.error.message}</div>}</>}

          {!showOnlyNotes && (
            <>
              {showTranscriptionSection && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Transcription</CardTitle>
                      <div className="flex items-center gap-2">
                        {transcriptionStatus && (
                          <Badge variant={transcriptionStatus === 'completed' ? 'success' : transcriptionStatus === 'failed' ? 'error' : 'warning'}>
                            {transcriptionStatus.charAt(0).toUpperCase() + transcriptionStatus.slice(1)}
                          </Badge>
                        )}
                        {existingNote?.transcriptionText && (
                          <Button type="button" variant="outline" size="sm" onClick={handleCopyToNotes} disabled={isPending}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy to Notes
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {existingNote?.transcriptionText ? (
                      <div className="prose prose-invert max-w-none min-h-[200px] px-8 py-6 bg-slate-900 rounded-lg border border-slate-700 whitespace-pre-wrap">
                        {existingNote.transcriptionText}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground px-8 py-6">
                        {transcriptionStatus === 'pending' && 'Transcription is pending...'}
                        {transcriptionStatus === 'failed' && 'Transcription failed. Please try again.'}
                        {!transcriptionStatus && 'No transcription available yet.'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {showSummarySection && (
                <SummarySection
                  noteId={noteId || ''}
                  savedSummary={existingNote?.aiSummary}
                  generatedSummary={generatedSummary}
                  isGenerating={false}
                  onSave={handleSaveSummary}
                  onRegenerate={handleRegenerateSummary}
                  isSaving={updateNoteMutation.isPending}
                />
              )}

              <Collapsible open={isAudioRecorderOpen} onOpenChange={setIsAudioRecorderOpen}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between cursor-pointer hover:bg-slate-700/30 transition-colors -mx-6 -my-6 px-6 py-6 rounded-t-2xl">
                        <CardTitle className="flex items-center gap-2">
                          <Mic className="w-5 h-5" />
                          Audio Recording
                        </CardTitle>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isAudioRecorderOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <AudioRecorder
                        disabled={isPending || isEditMode}
                        onAudioFile={handleAudioFile}
                        onAudioDelete={handleAudioDelete}
                        isUploading={transcribeAudioMutation.isPending}
                        audioPath={existingNote?.audioPath || undefined}
                        noCard={true}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {mutation.error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">{mutation.error.message}</div>}

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigate({ to: '/patients/$patientId/notes', params: { patientId: patientId } })
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditMode ? 'Update' : 'Create'} Note
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </>
  )
}
