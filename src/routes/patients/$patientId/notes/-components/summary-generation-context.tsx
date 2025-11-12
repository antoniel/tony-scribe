import { useGenerateResumo } from '@/hooks'
import { createContext, ReactNode, useContext, useState } from 'react'

interface ResumoGenerationContextValue {
  onGenerate: (template: 'soap' | 'progress' | 'discharge') => void
  isGenerating: boolean
  error: Error | null
  generatedResumo: string | null
  setGeneratedResumo: (summary: string | null) => void
}

const ResumoGenerationContext = createContext<ResumoGenerationContextValue | null>(null)

interface ResumoGenerationProviderProps {
  noteId: string
  children: ReactNode
}

export function ResumoGenerationProvider({ noteId, children }: ResumoGenerationProviderProps) {
  const generateResumo = useGenerateResumo(noteId)
  const [generatedResumo, setGeneratedResumo] = useState<string | null>(null)
  const [summaryError, setResumoError] = useState<Error | null>(null)

  const handleGenerateResumo = async (template: 'soap' | 'progress' | 'discharge') => {
    setResumoError(null)
    generateResumo.mutate(template, {
      onSuccess: (summary) => {
        setGeneratedResumo(summary)
      },
      onError: (error) => {
        setResumoError(error instanceof Error ? error : new Error('Falhou to generate summary'))
      }
    })
  }

  return (
    <ResumoGenerationContext.Provider
      value={{
        onGenerate: handleGenerateResumo,
        isGenerating: generateResumo.isPendente,
        error: summaryError,
        generatedResumo,
        setGeneratedResumo
      }}
    >
      {children}
    </ResumoGenerationContext.Provider>
  )
}

export function useResumoGeneration() {
  const context = useContext(ResumoGenerationContext)
  if (!context) {
    throw new Error('useResumoGeneration must be used within ResumoGenerationProvider')
  }
  return context
}
