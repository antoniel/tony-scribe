export type SummaryTemplateId = 'soap' | 'progress' | 'discharge'

export interface SummaryTemplate {
  id: SummaryTemplateId
  name: string
  description: string
}

export const SUMMARY_TEMPLATES: SummaryTemplate[] = [
  {
    id: 'soap',
    name: 'SOAP Note',
    description: 'Structured format with Subjective, Objective, Assessment, and Plan sections. Ideal for clinical documentation and progress tracking.'
  },
  {
    id: 'progress',
    name: 'Progress Note',
    description: 'Structured format with History, Exam, Assessment, and Plan sections. Suitable for ongoing patient care documentation.'
  },
  {
    id: 'discharge',
    name: 'Discharge Summary',
    description:
      'Structured format with Admission Diagnosis, Hospital Course, Discharge Condition, and Discharge Instructions. Perfect for patient discharge documentation.'
  }
]

export function getTemplateById(id: SummaryTemplateId): SummaryTemplate | undefined {
  return SUMMARY_TEMPLATES.find((template) => template.id === id)
}
