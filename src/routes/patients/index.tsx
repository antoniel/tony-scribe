import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePatients } from '@/hooks'
import { formatDate } from '@/lib/date-utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BookOpen, Loader, Plus, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/patients/')({
  component: PatientsPage
})

function PatientsPage() {
  const { data: patients, isLoading } = usePatients()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950/20 to-slate-950">
      <div className="container mx-auto py-8 space-y-6 px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-emerald-400" />
              Meus Estudos
            </h1>
            <p className="text-slate-400 mt-3 text-lg">Gerencie e visualize todos os seus estudos</p>
          </div>
          <Button 
            onClick={() => navigate({ to: '/patients/new' })}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Estudo
          </Button>
        </div>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Lista de Estudos
            </CardTitle>
            <CardDescription className="text-slate-400">Todos os estudos registrados no sistema</CardDescription>
          </CardHeader>
          <CardPanel>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : !patients || patients.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                      <BookOpen className="w-12 h-12 text-emerald-400" />
                    </div>
                  </EmptyMedia>
                  <EmptyTitle className="text-white text-xl">Nenhum estudo registrado</EmptyTitle>
                  <EmptyDescription className="text-slate-400">
                    Crie seu primeiro estudo para começar a organizar suas notas e aulas.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button 
                    onClick={() => navigate({ to: '/patients/new' })} 
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/50"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Estudo
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50 hover:bg-slate-800/50">
                    <TableHead className="text-emerald-300">Nome</TableHead>
                    <TableHead className="text-emerald-300">ID do Estudo</TableHead>
                    <TableHead className="text-emerald-300">Data de Criação</TableHead>
                    <TableHead className="text-emerald-300">Registrado em</TableHead>
                    <TableHead className="text-right text-emerald-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients?.map?.((patient) => (
                    <TableRow 
                      key={patient.id}
                      className="border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => navigate({ to: '/patients/$patientId', params: { patientId: patient.id } })}
                    >
                      <TableCell className="font-medium text-white">{patient.name}</TableCell>
                      <TableCell className="text-slate-400 font-mono text-sm">{patient.id.slice(0, 12)}...</TableCell>
                      <TableCell className="text-slate-300">{formatDate(patient.dateOfBirth)}</TableCell>
                      <TableCell className="text-sm text-slate-400">{formatDate(patient.createdAt, 'short')}</TableCell>
                      <TableCell className="text-right">
                        <Link 
                          to={'/patients/$patientId'} 
                          params={{ patientId: patient.id }} 
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
