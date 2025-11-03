import { eq } from 'drizzle-orm'
import { db } from './index'
import { Patients, newId } from './schema'

const seedPatients = async () => {
  try {
    console.log('Seeding database with initial patients...')

    const seedData = [
      {
        name: 'João Silva',
        dateOfBirth: new Date('1980-05-15')
      },
      {
        name: 'Maria Santos',
        dateOfBirth: new Date('1992-08-22')
      },
      {
        name: 'Carlos Oliveira',
        dateOfBirth: new Date('1975-03-10')
      }
    ]

    const now = new Date()

    for (const patient of seedData) {
      const existing = await db.select().from(Patients).where(eq(Patients.name, patient.name)).limit(1)

      if (existing.length === 0) {
        await db.insert(Patients).values({
          name: patient.name,
          dateOfBirth: patient.dateOfBirth,
          createdAt: now,
          updatedAt: now,
          id: newId('patient')
        })
        console.log(`✓ Created patient: ${patient.name}`)
      } else {
        console.log(`→ Patient already exists: ${patient.name}`)
      }
    }

    console.log('✓ Database seeding completed')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedPatients()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedPatients }
