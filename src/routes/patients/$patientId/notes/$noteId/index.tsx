import { Button } from '@/components/ui/button'
import { useDeleteNote, useNote, usePatient, useTranscribeNote, useUpdateNote } from '@/hooks'
import { AudioRecorderCard } from '@/routes/patients/$patientId/notes/-components/audio-recorder-card'
import { NoteForm } from '@/routes/patients/$patientId/notes/-components/note-form'
import { NoteHeader } from '@/routes/patients/$patientId/notes/-components/note-header'
import { SummaryCardWrapper } from '@/routes/patients/$patientId/notes/-components/summary-card-wrapper'
import { SummaryGenerationProvider, useSummaryGeneration } from '@/routes/patients/$patientId/notes/-components/summary-generation-context'
import { SummaryTemplateDialog } from '@/routes/patients/$patientId/notes/-components/summary-template-dialog'
import { TranscriptionCard } from '@/routes/patients/$patientId/notes/-components/transcription-card'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, FileText, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/patients/$patientId/notes/$noteId/')({
  component: NoteDetailPage
})

function NoteDetailPageContent() {
  const { patientId, noteId } = Route.useParams()
  const navigate = useNavigate()
  const { data: note, isLoading, error } = useNote(noteId)
  const { data: patient } = usePatient(patientId)
  const deleteNote = useDeleteNote()
  const updateNote = useUpdateNote(noteId)
  const transcribeNote = useTranscribeNote(noteId)
  const { onGenerate, isGenerating, error: summaryError } = useSummaryGeneration()
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const [editorContent, setEditorContent] = useState('')

  const handleNameUpdate = async (newName: string) => {
    await updateNote.mutateAsync({ id: noteId, name: newName })
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate(noteId, {
        onSuccess: () => navigate({ to: '/patients/$patientId/notes', params: { patientId } })
      })
    }
  }

  const handleTranscribe = async () => {
    transcribeNote.mutate(undefined, {
      onSuccess: () => {
        console.log('Transcription completed successfully')
      },
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred during transcription.'
        alert(`Transcription failed: ${errorMessage}`)
      }
    })
  }

  useEffect(() => {
    if (note?.rawContent) {
      setEditorContent(note.rawContent)
    }
  }, [note?.rawContent])

  const handleCopyToNotes = () => {
    if (note?.transcriptionText) {
      const currentNotes = editorContent.trim()
      const transcription = note.transcriptionText.trim()
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

  const handleAudioDelete = async () => {
    await updateNote.mutateAsync({
      id: noteId,
      audioPath: null,
      transcriptionStatus: 'pending' as const
    })
  }

  const handleAudioFile = async (file: File) => {
    setIsUploadingAudio(true)
    try {
      const formData = new FormData()
      formData.append('audio', file)

      const response = await fetch('/api/notes/transcribe', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.audioPath) {
        await updateNote.mutateAsync({
          id: noteId,
          audioPath: data.audioPath,
          transcriptionStatus: 'pending' as const
        })

        if (!response.ok && data.error) {
          alert(`Audio uploaded successfully, but transcription failed: ${data.message || data.error}`)
        }
      } else if (!response.ok) {
        throw new Error(data.error || 'Failed to upload audio')
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload audio')
    } finally {
      setIsUploadingAudio(false)
    }
  }

  const handleSaveSummary = async (summary: string) => {
    await updateNote.mutateAsync({
      id: noteId,
      aiSummary: summary
    })
  }

  const handleSaveNote = async () => {
    await updateNote.mutateAsync({
      id: noteId,
      rawContent: editorContent
    })
  }

  const showTranscribeButton = note && note.transcriptionStatus !== 'completed' && note.audioPath
  const transcribeButtonText = note?.transcriptionStatus === 'failed' ? 'Retry Transcription' : 'Transcribe Audio'
  const hasContent = note && (note.transcriptionText?.trim() || note.rawContent?.trim())
  const showGenerateSummaryButton = !!hasContent

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-destructive">Error loading note: {error?.message || 'Note not found'}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/patients/$patientId/notes', params: { patientId } })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {patient?.name}'s Notes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <NoteHeader
              patientName={patient?.name}
              noteName={note.name ?? ''}
              createdAt={note.createdAt ?? ''}
              transcriptionStatus={note.transcriptionStatus}
              onNameUpdate={handleNameUpdate}
              onDelete={handleDelete}
              onTranscribe={handleTranscribe}
              onSave={handleSaveNote}
              showTranscribeButton={!!showTranscribeButton}
              showGenerateSummaryButton={showGenerateSummaryButton}
              showSaveButton={true}
              transcribeButtonText={transcribeButtonText}
              isTranscribing={transcribeNote.isPending}
              isDeleting={deleteNote.isPending}
              isSaving={updateNote.isPending}
              generateSummaryTrigger={
                showGenerateSummaryButton ? (
                  <SummaryTemplateDialog
                    trigger={
                      <Button variant="default" size="sm" disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Summary
                          </>
                        )}
                      </Button>
                    }
                    onGenerate={onGenerate}
                    isGenerating={isGenerating}
                    error={summaryError}
                  />
                ) : undefined
              }
            />

            <NoteForm noteId={noteId} patientId={patientId} showOnlyNotes={true} editorContent={editorContent} setEditorContent={setEditorContent} />
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <TranscriptionCard transcriptionText={note.transcriptionText} transcriptionStatus={note.transcriptionStatus} onCopyToNotes={handleCopyToNotes} />

            <AudioRecorderCard
              audioPath={note.audioPath}
              isUploading={isUploadingAudio}
              isPending={updateNote.isPending}
              onAudioFile={handleAudioFile}
              onAudioDelete={handleAudioDelete}
            />

            <SummaryCardWrapper
              noteId={noteId}
              savedSummary={note.aiSummary}
              transcriptionText={note.transcriptionText}
              rawContent={note.rawContent}
              isSaving={updateNote.isPending}
              onSave={handleSaveSummary}
            />
          </aside>
        </div>
      </main>
    </div>
  )
}

function NoteDetailPage() {
  const { noteId } = Route.useParams()
  return (
    <SummaryGenerationProvider noteId={noteId}>
      <NoteDetailPageContent />
    </SummaryGenerationProvider>
  )
}
