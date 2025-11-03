import { CreateNoteButton } from '@/components/CreateNoteButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardPanel, CardTitle } from '@/components/ui/card'
import { useNotes, usePatient } from '@/hooks'
import { formatDate } from '@/lib/date-utils'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/patients/$patientId/notes/')({
  component: PatientNotes
})

interface Patient {
  id: string
  name: string
  dateOfBirth: string
  createdAt: string
  updatedAt: string
}

interface Note {
  id: string
  name: string | null
  patientId: string
  rawContent: string
  aiSummary: string | null
  transcriptionStatus: 'pending' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

function PatientNotes() {
  const { patientId } = Route.useParams()

  const { data: patient, isLoading: isLoadingPatient } = usePatient(patientId)
  const { data: notes, isLoading: isLoadingNotes } = useNotes(patientId)

  if (isLoadingPatient || isLoadingNotes) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardPanel className="p-6">
                <div className="h-20 bg-slate-700/50 rounded animate-pulse" />
              </CardPanel>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardPanel className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-700/50 rounded animate-pulse" />
                  ))}
                </div>
              </CardPanel>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardPanel className="p-12 text-center">
              <p className="text-slate-400 mb-6">Patient not found</p>
              <Button render={<Link to="/" className="inline-flex" />} variant="default">
                Back to Home
              </Button>
            </CardPanel>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Button render={<Link to="/" className="inline-flex" />} variant="ghost" size="sm" className="mb-6">
          ← Back to Patient Roster
        </Button>

        <PatientHeader patient={patient} />

        <NotesListTable notes={notes || []} patientId={patientId} />
      </main>
    </div>
  )
}

function PatientHeader({ patient }: { patient: Patient }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 mb-8">
      <CardPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
            <p className="text-slate-400 mt-1">Date of Birth: {formatDate(new Date(patient.dateOfBirth))}</p>
          </div>
          <CreateNoteButton patientId={patient.id} variant="default" size="lg">
            + New Note
          </CreateNoteButton>
        </div>
      </CardPanel>
    </Card>
  )
}

function NotesListTable({ notes, patientId }: { notes: Note[]; patientId: string }) {
  if (notes.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardPanel className="p-12 text-center">
          <p className="text-slate-400 mb-6">No notes found for this patient. Create the first note to get started.</p>
          <CreateNoteButton patientId={patientId} variant="default" size="lg">
            Create First Note
          </CreateNoteButton>
        </CardPanel>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle>Clinical Notes ({notes.length})</CardTitle>
      </CardHeader>
      <CardPanel>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Note Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-white">{note.name || 'Untitled Note'}</div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">{note.rawContent || note.aiSummary || 'No content'}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300">{formatDate(new Date(note.createdAt))}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={note.transcriptionStatus === 'completed' ? 'default' : note.transcriptionStatus === 'pending' ? 'secondary' : 'destructive'}
                      className="capitalize"
                    >
                      {note.transcriptionStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      render={<Link to="/patients/$patientId/notes/$noteId" params={{ patientId, noteId: note.id }} className="inline-flex" />}
                      variant="ghost"
                      size="sm"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardPanel>
    </Card>
  )
}
