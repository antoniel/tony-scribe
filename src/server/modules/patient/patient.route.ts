import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { match } from 'ts-pattern'
import type { AppVariables } from '../../types'
import * as patientSchema from './patient.schema'
import * as patientService from './patient.service'

export const patientRoutes = new Hono<{ Variables: AppVariables }>()
  .get('/', async (c) => {
    const result = await patientService.getAllPatients(c)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'database_error' }, () => new Error('Failed to fetch patients'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .exhaustive()
    }
    return c.json(result.data)
  })
  .get('/with-stats', async (c) => {
    const result = await patientService.getPatientsWithStats(c)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'database_error' }, () => new Error('Failed to fetch patients with stats'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .exhaustive()
    }
    return c.json(result.data)
  })
  .get('/recent', async (c) => {
    const result = await patientService.getRecentPatients(c)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'database_error' }, () => new Error('Failed to fetch recent patients'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .exhaustive()
    }
    return c.json(result.data)
  })
  .get('/:id', zValidator('param', patientSchema.patientIdParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const result = await patientService.getPatientById(c, id)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'database_error' }, () => new Error('Failed to fetch patient'))
        .exhaustive()
    }
    return c.json(result.data)
  })
  .post('/', zValidator('json', patientSchema.createPatientSchema), async (c) => {
    const validatedData = c.req.valid('json')
    const result = await patientService.createPatient(c, validatedData)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'database_error' }, () => new Error('Failed to create patient'))
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .exhaustive()
    }
    return c.json(result.data, 201)
  })
  .put('/:id', zValidator('param', patientSchema.patientIdParamSchema), zValidator('json', patientSchema.updatePatientSchema), async (c) => {
    const { id } = c.req.valid('param')
    const validatedData = c.req.valid('json')
    const result = await patientService.updatePatient(c, id, validatedData)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'database_error' }, () => new Error('Failed to update patient'))
        .exhaustive()
    }
    return c.json(result.data)
  })
  .delete('/:id', zValidator('param', patientSchema.patientIdParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const result = await patientService.deletePatient(c, id)
    if (!result.ok) {
      throw match(result.error)
        .with({ type: 'patient_not_found' }, () => new Error('Patient not found'))
        .with({ type: 'database_error' }, () => new Error('Failed to delete patient'))
        .exhaustive()
    }
    return c.body(null, 204)
  })
