import { CreateNoteButton } from '@/components/CreateNoteButton'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import { usePatientsWithStats } from '@/hooks'
import { formatDate } from '@/lib/date-utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <StatsBar />
        <PatientRoster />
      </main>
    </div>
  )
}

function PatientRoster() {
  const navigate = useNavigate()
  const { data: patients, isLoading } = usePatientsWithStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardPanel className="p-6">
              <div className="space-y-3">
                <div className="h-6 bg-slate-700/50 rounded animate-pulse" />
                <div className="h-4 bg-slate-700/50 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-slate-700/50 rounded w-1/2 animate-pulse" />
              </div>
            </CardPanel>
          </Card>
        ))}
      </div>
    )
  }

  if (!patients || patients.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardPanel className="p-12 text-center">
          <p className="text-slate-400 mb-6">Nenhum estudante encontrado. Crie seu primeiro estudante para começar.</p>
          <Button variant="default" size="lg">
            <Link to="/patients/new" className="inline-flex" />
            Adicionar Primeiro Estudante
          </Button>
        </CardPanel>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Roster de Estudantes</h2>
          <p className="text-slate-400 mt-1">Selecione um estudante para visualizar ou criar notas</p>
        </div>
        <Button variant="default">
          <Link to="/patients/new" className="inline-flex">
            Adicionar Estudante
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <Card
            key={patient.id}
            className="bg-slate-800/50 border-slate-700 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer group"
            onClick={() => navigate({ to: '/patients/$patientId/notes', params: { patientId: patient.id } })}
          >
            <CardPanel className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">{patient.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">Matrícula: {formatDate(new Date(patient.enrollmentDate))}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500">Total de Notas</p>
                    <p className="text-xl font-bold text-cyan-400">{patient.notesCount}</p>
                  </div>
                  {patient.lastNoteDate && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Última Nota</p>
                      <p className="text-sm text-slate-300">{formatDate(new Date(patient.lastNoteDate))}</p>
                    </div>
                  )}
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <CreateNoteButton patientId={patient.id} variant="outline" size="sm" className="w-full">
                    + Nova Nota
                  </CreateNoteButton>
                </div>
              </div>
            </CardPanel>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StatsBar() {
  const { data: patients } = usePatientsWithStats()

  const totalStudents = patients?.length || 0
  const totalNotes = patients?.reduce((sum, p) => sum + p.notesCount, 0) || 0

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardPanel className="p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">Total de Estudantes</p>
            <p className="text-2xl font-bold text-white">{totalStudents}</p>
          </div>
        </CardPanel>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardPanel className="p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">Total de Relatórios</p>
            <p className="text-2xl font-bold text-white">{totalNotes}</p>
          </div>
        </CardPanel>
      </Card>
    </div>
  )
}
