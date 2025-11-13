import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter, DialogHeader, DialogPopup, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUMMARY_TEMPLATES, type SummaryTemplateId } from '@/lib/summary-templates'
import { Loader } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SummaryTemplateDialogProps {
  onGenerate: (template: SummaryTemplateId) => void
  isGenerating: boolean
  error?: Error | null
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function SummaryTemplateDialog({ onGenerate, isGenerating, error, trigger, onSuccess }: SummaryTemplateDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<SummaryTemplateId>('soap')
  const [open, setOpen] = useState(false)

  const selectedTemplateData = SUMMARY_TEMPLATES.find((t) => t.id === selectedTemplate)

  const handleGenerate = () => {
    if (selectedTemplate) {
      onGenerate(selectedTemplate)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSelectedTemplate('soap')
    }
  }

  const prevIsGeneratingRef = useRef(isGenerating)
  useEffect(() => {
    if (prevIsGeneratingRef.current && !isGenerating && !error && open) {
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    }
    prevIsGeneratingRef.current = isGenerating
  }, [isGenerating, error, open, onSuccess])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Resumo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar Template</label>
            <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as SummaryTemplateId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {SUMMARY_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>

          {selectedTemplateData && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <h4 className="text-sm font-semibold mb-2">{selectedTemplateData.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedTemplateData.description}</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error.message || 'Falhou ao gerar resumo'}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !selectedTemplate}>
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              'Gerar Resumo'
            )}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
