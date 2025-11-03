import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardPanel, CardTitle } from '@/components/ui/card'
import { Field, FieldControl, FieldLabel } from '@/components/ui/field'
import { useCreatePatient, usePatient, useUpdatePatient } from '@/hooks'
import { useNavigate } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
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
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Patient' : 'Create Patient'}</CardTitle>
        </CardHeader>
        <CardPanel>
          {isLoadingPatient ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field>
                <FieldLabel htmlFor="name">Patient Name</FieldLabel>
                <FieldControl
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter patient name"
                  defaultValue={isEditMode ? existingPatient?.name : ''}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
                <FieldControl
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  defaultValue={isEditMode && existingPatient?.dateOfBirth ? existingPatient.dateOfBirth.split('T')[0] : ''}
                  required
                />
              </Field>

              {mutation.error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">{mutation.error.message}</div>}

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate({ to: '/patients' })} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditMode ? 'Update' : 'Create'} Patient
                </Button>
              </div>
            </form>
          )}
        </CardPanel>
      </Card>
    </div>
  )
}
