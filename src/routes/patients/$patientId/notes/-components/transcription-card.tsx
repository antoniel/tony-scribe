import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy } from 'lucide-react'

interface TranscriptionCardProps {
  transcriptionText?: string | null
  transcriptionStatus?: string | null
  onCopyToNotes?: () => void
}

export function TranscriptionCard({ transcriptionText, transcriptionStatus, onCopyToNotes }: TranscriptionCardProps) {
  if (!transcriptionText && !transcriptionStatus) {
    return null
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transcrição</CardTitle>
          <div className="flex items-center gap-2">
            {transcriptionStatus && (
              <Badge variant={transcriptionStatus === 'completed' ? 'success' : transcriptionStatus === 'failed' ? 'error' : 'warning'}>
                {transcriptionStatus.charAt(0).toUpperCase() + transcriptionStatus.slice(1)}
              </Badge>
            )}
            {transcriptionText && onCopyToNotes && (
              <Button type="button" variant="outline" size="sm" onClick={onCopyToNotes}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar para Notas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transcriptionText ? (
          <div className="prose prose-invert max-w-none min-h-[200px] px-4 py-4 bg-slate-900 rounded-lg border border-slate-700 whitespace-pre-wrap text-sm">
            {transcriptionText}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground px-4 py-4">
            {transcriptionStatus === 'pending' && 'Transcrição pendente...'}
            {transcriptionStatus === 'failed' && 'Transcrição falhou. Por favor, tente novamente.'}
            {!transcriptionStatus && 'Nenhuma transcrição disponível ainda.'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
