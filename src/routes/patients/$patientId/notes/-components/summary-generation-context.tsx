import { useGenerateSummary } from '@/hooks'
import { createContext, ReactNode, useContext, useState } from 'react'

interface SummaryGenerationContextValue {
  onGenerate: (template: 'soap' | 'progress' | 'discharge') => void
  isGenerating: boolean
  error: Error | null
  generatedSummary: string | null
  setGeneratedSummary: (summary: string | null) => void
}

const SummaryGenerationContext = createContext<SummaryGenerationContextValue | null>(null)

interface SummaryGenerationProviderProps {
  noteId: string
  children: ReactNode
}

export function SummaryGenerationProvider({ noteId, children }: SummaryGenerationProviderProps) {
  const generateSummary = useGenerateSummary(noteId)
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<Error | null>(null)

  const handleGenerateSummary = async (template: 'soap' | 'progress' | 'discharge') => {
    setSummaryError(null)
    generateSummary.mutate(template, {
      onSuccess: (summary) => {
        setGeneratedSummary(summary)
      },
      onError: (error) => {
        setSummaryError(error instanceof Error ? error : new Error('Failed to generate summary'))
      }
    })
  }

  return (
    <SummaryGenerationContext.Provider
      value={{
        onGenerate: handleGenerateSummary,
        isGenerating: generateSummary.isPending,
        error: summaryError,
        generatedSummary,
        setGeneratedSummary
      }}
    >
      {children}
    </SummaryGenerationContext.Provider>
  )
}

export function useSummaryGeneration() {
  const context = useContext(SummaryGenerationContext)
  if (!context) {
    throw new Error('useSummaryGeneration must be used within SummaryGenerationProvider')
  }
  return context
}
