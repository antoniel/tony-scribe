import { useQuery } from '@tanstack/react-query'

export interface PatientWithStats {
  id: string
  name: string
  enrollmentDate: string
  createdAt: string
  updatedAt: string
  notesCount: number
  lastNoteDate: string | null
}

export function usePatientsWithStats() {
  return useQuery<PatientWithStats[]>({
    queryKey: ['patients', 'with-stats'],
    queryFn: async () => {
      const response = await fetch('/api/patients/with-stats')
      if (!response.ok) throw new Error('Failed to fetch patients')
      return response.json()
    }
  })
}
