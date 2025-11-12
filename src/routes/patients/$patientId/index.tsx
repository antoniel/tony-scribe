import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDeletePatient, useNotes, usePatient } from '@/hooks'
import { formatDate, formatDateTime } from '@/lib/date-utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, BookOpen, Edit, FileText, Loader, Plus, Sparkles, Trash2 } from 'lucide-react'

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
    if (confirm('Tem certeza que deseja deletar este estudo? Esta ação não pode ser desfeita.')) {
      deletePatient.mutate(patientId, {
        onSuccess: () => navigate({ to: '/patients' })
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-950">
        <Loader className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-950">
        <div className="container mx-auto py-8 px-6">
          <div className="bg-red-500/10 text-red-400 px-6 py-4 rounded-lg border border-red-500/20">
            Erro ao carregar estudo: {error?.message || 'Estudo não encontrado'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-950">
      <div className="container mx-auto py-8 space-y-6 px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate({ to: '/patients' })}
            className="border-slate-700/50 text-slate-300 hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-emerald-400" />
                  {patient.name}
                </CardTitle>
                <CardDescription className="mt-3 space-y-1 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-emerald-400">ID:</span>
                    <span className="font-mono text-sm">{patient.id.slice(0, 16)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-emerald-400">Início:</span>
                    <span className="text-sm">{formatDate(patient.dateOfBirth)}</span>
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate({ to: `/patients/${patientId}/edit` })}
                  className="border-slate-700/50 text-slate-300 hover:bg-slate-800/50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete} 
                  disabled={deletePatient.isPending}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-emerald-400" />
              Notas do Estudo
            </h2>
            <p className="text-slate-400 mt-2">Todas as anotações e gravações deste estudo</p>
          </div>
          <Button 
            onClick={() => navigate({ to: '/patients/$patientId/notes', params: { patientId } })}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ver Todas as Notas
          </Button>
        </div>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardPanel>
            {!notes || notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 mb-4">
                  <Sparkles className="w-12 h-12 text-emerald-400" />
                </div>
                <p className="text-slate-300 text-lg">Nenhuma nota encontrada para este estudo.</p>
                <p className="text-slate-400 text-sm mt-2">Comece criando sua primeira nota!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50 hover:bg-slate-800/50">
                    <TableHead className="text-emerald-300">Data</TableHead>
                    <TableHead className="text-emerald-300">Prévia</TableHead>
                    <TableHead className="text-right text-emerald-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes.map((note) => (
                    <TableRow 
                      key={note.id}
                      className="border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                    >
                      <TableCell className="text-sm text-slate-300">{formatDateTime(note.createdAt)}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-slate-400">{note.rawContent.substring(0, 80)}...</TableCell>
                      <TableCell className="text-right">
                        <Link 
                          to="/patients/$patientId/notes/$noteId" 
                          params={{ patientId, noteId: note.id }} 
                          className="text-emerald-400 hover:text-emerald-300 hover:underline text-sm font-medium transition-colors"
                        >
                          Visualizar
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
    </div>
  )
}
