import { eq } from 'drizzle-orm'
import { db } from './index'
import { Students, newId } from './schema'

const seedStudents = async () => {
  try {
    console.log('Seeding database with initial students...')

    const seedData = [
      {
        name: 'Ana Clara Costa',
        enrollmentDate: new Date('2023-03-15')
      },
      {
        name: 'Bruno Henrique Lima',
        enrollmentDate: new Date('2022-08-22')
      },
      {
        name: 'Carolina Ferreira',
        enrollmentDate: new Date('2024-01-10')
      }
    ]

    const now = new Date()

    for (const student of seedData) {
      const existing = await db.select().from(Students).where(eq(Students.name, student.name)).limit(1)

      if (existing.length === 0) {
        await db.insert(Students).values({
          name: student.name,
          enrollmentDate: student.enrollmentDate,
          createdAt: now,
          updatedAt: now,
          id: newId('student')
        })
        console.log(`✓ Created student: ${student.name}`)
      } else {
        console.log(`→ Student already exists: ${student.name}`)
      }
    }

    console.log('✓ Database seeding completed')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedStudents()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedStudents }
