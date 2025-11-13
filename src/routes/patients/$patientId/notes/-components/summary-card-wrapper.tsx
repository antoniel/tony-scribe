import { useSummaryGeneration } from './summary-generation-context'
import { SummarySection } from './summary-section'

interface SummaryCardWrapperProps {
  noteId: string
  savedSummary?: string | null
  transcriptionText?: string | null
  rawContent?: string | null
  isSaving?: boolean
  onSave: (summary: string) => Promise<void>
}

export function SummaryCardWrapper({ noteId, savedSummary, transcriptionText, rawContent, isSaving = false, onSave }: SummaryCardWrapperProps) {
  const { generatedSummary, isGenerating, setGeneratedSummary } = useSummaryGeneration()

  const hasContent = transcriptionText?.trim() || rawContent?.trim()
  const showSummarySection = savedSummary || generatedSummary || !!hasContent

  const handleSaveSummary = async (summary: string) => {
    await onSave(summary)
    setGeneratedSummary(null)
  }

  const handleRegenerateSummary = () => {
    setGeneratedSummary(null)
  }

  if (!showSummarySection) {
    return null
  }

  return (
    <SummarySection
      noteId={noteId}
      savedSummary={savedSummary}
      generatedSummary={generatedSummary}
      isGenerating={isGenerating}
      onSave={handleSaveSummary}
      onRegenerate={handleRegenerateSummary}
      isSaving={isSaving}
    />
  )
}
