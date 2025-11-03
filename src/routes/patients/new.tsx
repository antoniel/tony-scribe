import { createFileRoute } from '@tanstack/react-router'
import { PatientForm } from './-components/patient-form'

export const Route = createFileRoute('/patients/new')({
  component: NewPatientPage
})

function NewPatientPage() {
  return <PatientForm />
}
