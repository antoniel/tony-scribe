import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EditableNoteTitle } from '@/components/ui/editable-note-title'
import { formatDateTime } from '@/lib/date-utils'
import { Loader, Mic, MoreVertical, Save, Trash2 } from 'lucide-react'

interface NoteHeaderProps {
  patientName?: string
  noteName: string | null
  createdAt: string | null
  transcriptionStatus?: string | null
  onNameUpdate: (newName: string) => Promise<void>
  onDelete: () => void
  onTranscribe?: () => void
  onSave?: () => void
  showTranscribeButton?: boolean
  showGenerateSummaryButton?: boolean
  showSaveButton?: boolean
  transcribeButtonText?: string
  isTranscribing?: boolean
  isDeleting?: boolean
  isSaving?: boolean
  generateSummaryTrigger?: React.ReactNode
}

export function NoteHeader({
  patientName,
  noteName,
  createdAt,
  transcriptionStatus,
  onNameUpdate,
  onDelete,
  onTranscribe,
  onSave,
  showTranscribeButton = false,
  showGenerateSummaryButton = false,
  showSaveButton = false,
  transcribeButtonText = 'Transcrever Áudio',
  isTranscribing = false,
  isDeleting = false,
  isSaving = false,
  generateSummaryTrigger
}: NoteHeaderProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{patientName}</h2>
              <div className="mt-1">
                <EditableNoteTitle value={noteName || ''} onSave={onNameUpdate} />
              </div>
            </div>
            <CardDescription className="text-sm text-muted-foreground space-y-1">
              <div>Criado: {createdAt ? formatDateTime(createdAt) : 'N/A'}</div>
              {transcriptionStatus && <div className="capitalize">Status: {transcriptionStatus}</div>}
            </CardDescription>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {showSaveButton && onSave && (
              <Button variant="default" size="sm" onClick={onSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Nota
                  </>
                )}
              </Button>
            )}
            {showGenerateSummaryButton && generateSummaryTrigger}
            {showTranscribeButton && onTranscribe && (
              <Button variant="default" size="sm" onClick={onTranscribe} disabled={isTranscribing}>
                {isTranscribing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Transcrevendo...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    {transcribeButtonText}
                  </>
                )}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Mais opções">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onClick={onDelete} disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar Nota
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
