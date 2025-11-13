import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SummarySectionProps {
  noteId: string
  savedSummary?: string | null
  generatedSummary?: string | null
  isGenerating: boolean
  onSave: (summary: string) => void
  onRegenerate: () => void
  isSaving?: boolean
}

export function SummarySection({ savedSummary, generatedSummary, isGenerating, onSave, onRegenerate, isSaving = false }: SummarySectionProps) {
  const [editedSummary, setEditedSummary] = useState(generatedSummary || '')

  useEffect(() => {
    if (generatedSummary) {
      setEditedSummary(generatedSummary)
    }
  }, [generatedSummary])

  const handleSave = () => {
    if (editedSummary.trim()) {
      onSave(editedSummary.trim())
    }
  }

  if (savedSummary && !generatedSummary) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resumo</CardTitle>
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isGenerating}>
              Regenerate Resumo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none min-h-[200px] px-8 py-6 bg-slate-900 rounded-lg border border-slate-700 whitespace-pre-wrap">
            {savedSummary}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (generatedSummary || isGenerating) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="flex items-center justify-center min-h-[200px] py-12">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Generating summary...</span>
            </div>
          ) : (
            <>
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="min-h-[200px] font-mono text-sm bg-slate-900 border-slate-700"
                placeholder="Generated summary will appear here..."
              />
              <div className="flex gap-2 justify-end mt-4">
                <Button onClick={handleSave} disabled={isSaving || !editedSummary.trim()}>
                  {isSaving ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Resumo'
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return null
}
