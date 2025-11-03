import { client } from '@/lib/api-client'
import type { UpdatePatientDTO } from '@/server/modules/patient/patient.model'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType } from 'hono/client'
import { JSONParsed } from 'hono/utils/types'

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await client.api.patients.$get()
      return res.json()
    }
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const res = await client.api.patients[':id'].$get({ param: { id } })
      return res.json()
    },
    enabled: !!id
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InferRequestType<typeof client.api.patients.$post>['json']) => {
      const res = await client.api.patients.$post({ json: data })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    }
  })
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: JSONParsed<UpdatePatientDTO>) => {
      const res = await client.api.patients[':id'].$put({ param: { id }, json: data })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patients', id] })
    }
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.api.patients[':id'].$delete({ param: { id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    }
  })
}
