import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardPanel, CardTitle } from '@/components/ui/card'
import { Field, FieldControl, FieldLabel } from '@/components/ui/field'
import { useCreatePatient, usePatient, useUpdatePatient } from '@/hooks'
import { useNavigate } from '@tanstack/react-router'
import { BookOpen, Loader, Sparkles } from 'lucide-react'
import { useEffect } from 'react'

interface PatientFormProps {
  patientId?: string
}

export function PatientForm({ patientId }: PatientFormProps) {
  const navigate = useNavigate()
  const isEditMode = !!patientId
  const { data: existingPatient, isLoading: isLoadingPatient } = usePatient(patientId || '')
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient(patientId || '')

  const mutation = isEditMode ? updateMutation : createMutation
  const isPending = mutation.isPending || (isEditMode && isLoadingPatient)

  useEffect(() => {
    if (mutation.isSuccess) {
      navigate({ to: '/patients' })
    }
  }, [mutation.isSuccess, navigate])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get('name') as string,
      dateOfBirth: formData.get('dateOfBirth') as string
    }

    if (isEditMode) {
      return updateMutation.mutate(data)
    }
    return createMutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-950">
      <div className="container mx-auto py-8 max-w-2xl px-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              {isEditMode ? (
                <>
                  <BookOpen className="w-7 h-7 text-emerald-400" />
                  Editar Estudo
                </>
              ) : (
                <>
                  <Sparkles className="w-7 h-7 text-emerald-400" />
                  Criar Novo Estudo
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardPanel>
            {isLoadingPatient ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Field>
                  <FieldLabel htmlFor="name" className="text-slate-200 font-medium">
                    Nome do Estudo / Disciplina
                  </FieldLabel>
                  <FieldControl
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Ex: Cálculo I, História da Arte, Programação..."
                    defaultValue={isEditMode ? existingPatient?.name : ''}
                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="dateOfBirth" className="text-slate-200 font-medium">
                    Data de Início
                  </FieldLabel>
                  <FieldControl
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    defaultValue={isEditMode && existingPatient?.dateOfBirth ? existingPatient.dateOfBirth.split('T')[0] : ''}
                    className="bg-slate-800/50 border-slate-700/50 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    required
                  />
                </Field>

                {mutation.error && (
                  <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg border border-red-500/20">
                    {mutation.error.message}
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate({ to: '/patients' })} 
                    disabled={isPending}
                    className="border-slate-700/50 text-slate-300 hover:bg-slate-800/50"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/50"
                  >
                    {isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    {isEditMode ? 'Atualizar' : 'Criar'} Estudo
                  </Button>
                </div>
              </form>
            )}
          </CardPanel>
        </Card>
        
        <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-emerald-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-2">💡 Dica para Estudantes</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Organize seus estudos por disciplina! Cada estudo pode conter múltiplas notas de aula, 
                resumos e gravações de áudio. Use a IA para gerar resumos automáticos e facilitar sua revisão.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
