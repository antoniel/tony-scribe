import { index, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 16)

const prefixes = {
  student: 'stu',
  note: 'not'
} as const

const defaultColumn = (prefix: keyof typeof prefixes) => ({
  id: text('id')
    .primaryKey()
    .$defaultFn(() => newId(prefix)),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
    .notNull()
})

export function newId(prefix: keyof typeof prefixes): string {
  return [prefixes[prefix], nanoid()].join('_')
}

export const Students = pgTable('students', {
  ...defaultColumn('student'),
  name: varchar('name', { length: 255 }).notNull(),
  enrollmentDate: timestamp('enrollment_date').notNull()
})

export const transcriptionSourceEnum = pgEnum('transcription_source', ['text', 'audio'])
export const transcriptionStatusEnum = pgEnum('transcription_status', ['pending', 'completed', 'failed'])

export const Notes = pgTable(
  'notes',
  {
    ...defaultColumn('note'),
    name: varchar('name', { length: 255 }),
    studentId: text('student_id')
      .notNull()
      .references(() => Students.id, { onDelete: 'cascade' }),
    rawContent: text('raw_content').notNull(),
    transcriptionText: text('transcription_text'),
    aiSummary: text('ai_summary'),
    audioPath: varchar('audio_path', { length: 255 }),
    transcriptionStatus: transcriptionStatusEnum('transcription_status').notNull().default('pending')
  },
  (table) => ({
    studentIdIdx: index('notes_student_id_idx').on(table.studentId)
  })
)
