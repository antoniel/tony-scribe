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
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground mt-2">Manage and view patient records</p>
        </div>
        <Button onClick={() => navigate({ to: '/patients/new' })}>
          <Plus className="w-4 h-4 mr-2" />
          New Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>All registered patients in the system</CardDescription>
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
                <EmptyTitle>No patients registered</EmptyTitle>
                <EmptyDescription>Create your first patient to start managing records.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => navigate({ to: '/patients/new' })} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients?.map?.((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.id}</TableCell>
                    <TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(patient.createdAt, 'short')}</TableCell>
                    <TableCell className="text-right">
                      <Link to={'/patients/$patientId'} params={{ patientId: patient.id }} className="text-primary hover:underline text-sm">
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
