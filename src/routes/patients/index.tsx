import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePatients } from '@/hooks'
import { formatDate } from '@/lib/date-utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Loader, Plus, Users } from 'lucide-react'

export const Route = createFileRoute('/patients/')({
  component: PatientsPage
})

function PatientsPage() {
  const { data: patients, isLoading } = usePatients()
  const navigate = useNavigate()

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estudantes</h1>
          <p className="text-muted-foreground mt-2">Gerencie e visualize registros de estudantes</p>
        </div>
        <Button onClick={() => navigate({ to: '/patients/new' })}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Estudante
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudantes</CardTitle>
          <CardDescription>Todos os estudantes registrados no sistema</CardDescription>
        </CardHeader>
        <CardPanel>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !patients || patients.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>Nenhum estudante registrado</EmptyTitle>
                <EmptyDescription>Crie seu primeiro estudante para começar a gerenciar registros.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => navigate({ to: '/patients/new' })} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Estudante
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>ID do Estudante</TableHead>
                  <TableHead>Data de Matrícula</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients?.map?.((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.id}</TableCell>
                    <TableCell>{formatDate(patient.enrollmentDate)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(patient.createdAt, 'short')}</TableCell>
                    <TableCell className="text-right">
                      <Link to={'/patients/$patientId'} params={{ patientId: patient.id }} className="text-primary hover:underline text-sm">
                        Ver
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
