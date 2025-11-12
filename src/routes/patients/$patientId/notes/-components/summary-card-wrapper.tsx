import { useResumoGeneration } from './summary-generation-context'
import { ResumoSection } from './summary-section'

interface ResumoCardWrapperProps {
  noteId: string
  savedResumo?: string | null
  transcriptionText?: string | null
  rawContent?: string | null
  isSaving?: boolean
  onSalvar: (summary: string) => Promise<void>
}

export function ResumoCardWrapper({ noteId, savedResumo, transcriptionText, rawContent, isSaving = false, onSalvar }: ResumoCardWrapperProps) {
  const { generatedResumo, isGenerating, setGeneratedResumo } = useResumoGeneration()

  const hasContent = transcriptionText?.trim() || rawContent?.trim()
  const showResumoSection = savedResumo || generatedResumo || !!hasContent

  const handleSalvarResumo = async (summary: string) => {
    await onSalvar(summary)
    setGeneratedResumo(null)
  }

  const handleRegenerateResumo = () => {
    setGeneratedResumo(null)
  }

  if (!showResumoSection) {
    return null
  }

  return (
    <ResumoSection
      noteId={noteId}
      savedResumo={savedResumo}
      generatedResumo={generatedResumo}
      isGenerating={isGenerating}
      onSalvar={handleSalvarResumo}
      onRegenerate={handleRegenerateResumo}
      isSaving={isSaving}
    />
  )
}
