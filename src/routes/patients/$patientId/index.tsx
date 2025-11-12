import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDeletePatient, useNotes, usePatient } from '@/hooks'
import { formatDate, formatDateTime } from '@/lib/date-utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Edit, Loader, Plus, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/patients/$patientId/')({
  component: PatientDetailPage
})

function PatientDetailPage() {
  const { patientId } = Route.useParams()
  const navigate = useNavigate()
  const { data: patient, isLoading, error } = usePatient(patientId)
  const { data: notes } = useNotes(patientId)
  const deletePatient = useDeletePatient()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this patient?')) {
      deletePatient.mutate(patientId, {
        onSuccess: () => navigate({ to: '/patients' })
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">Error loading patient: {error?.message || 'Patient not found'}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: '/patients' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{patient.name}</CardTitle>
              <CardDescription className="mt-2">
                <div>ID: {patient.id}</div>
                <div>DOB: {formatDate(patient.enrollmentDate)}</div>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate({ to: `/patients/${patientId}/edit` })}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deletePatient.isPending}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Notes</h2>
          <p className="text-muted-foreground mt-2">Clinical notes for this patient</p>
        </div>
        <Button onClick={() => navigate({ to: '/patients/$patientId/notes', params: { patientId } })}>
          <Plus className="w-4 h-4 mr-2" />
          View Notes
        </Button>
      </div>

      <Card>
        <CardPanel>
          {!notes || notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No notes found for this patient.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="text-sm">{formatDateTime(note.createdAt)}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{note.rawContent.substring(0, 80)}...</TableCell>
                    <TableCell className="text-right">
                      <Link to="/patients/$patientId/notes/$noteId" params={{ patientId, noteId: note.id }} className="text-primary hover:underline text-sm">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardPanel>
      </Card>
    </div>
  )
}
