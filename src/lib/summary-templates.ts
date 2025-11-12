export type SummaryTemplateId = 'soap' | 'progress' | 'discharge'

export interface SummaryTemplate {
  id: SummaryTemplateId
  name: string
  description: string
}

export const SUMMARY_TEMPLATES: SummaryTemplate[] = [
  {
    id: 'soap',
    name: 'Academic Progress Report',
    description: 'Structured format with Situation, Observations, Analysis, and Plan sections. Ideal for student progress tracking and academic documentation.'
  },
  {
    id: 'progress',
    name: 'Learning Assessment',
    description: 'Structured format with Background, Performance, Assessment, and Action Plan sections. Suitable for ongoing student development documentation.'
  },
  {
    id: 'discharge',
    name: 'Course Completion Summary',
    description:
      'Structured format with Initial Assessment, Learning Journey, Final Status, and Recommendations. Perfect for end-of-course student documentation.'
  }
]

export function getTemplateById(id: SummaryTemplateId): SummaryTemplate | undefined {
  return SUMMARY_TEMPLATES.find((template) => template.id === id)
}
