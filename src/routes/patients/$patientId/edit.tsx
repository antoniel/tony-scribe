import { createFileRoute } from '@tanstack/react-router'
import { PatientForm } from '../-components/patient-form'

export const Route = createFileRoute('/patients/$patientId/edit')({
  component: EditPatientPage
})

function EditPatientPage() {
  const { patientId } = Route.useParams()
  return <PatientForm patientId={patientId} />
}
