import type { db } from '../server/database'

type DatabaseInstance = typeof db

export interface AppVariables {
  db: DatabaseInstance
}
