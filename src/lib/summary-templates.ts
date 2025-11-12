export type SummaryTemplateId = 'soap' | 'progress' | 'discharge'

export interface SummaryTemplate {
  id: SummaryTemplateId
  name: string
  description: string
}

export const SUMMARY_TEMPLATES: SummaryTemplate[] = [
  {
    id: 'soap',
    name: 'Nota SOAP',
    description: 'Formato estruturado com seções Subjetivo, Objetivo, Avaliação e Plano. Ideal para documentação acadêmica e acompanhamento de progresso.'
  },
  {
    id: 'progress',
    name: 'Nota de Progresso',
    description: 'Formato estruturado com seções de Histórico, Exame, Avaliação e Plano. Adequado para documentação contínua de estudos.'
  },
  {
    id: 'discharge',
    name: 'Resumo de Conclusão',
    description:
      'Formato estruturado com Diagnóstico Inicial, Desenvolvimento, Condição Final e Instruções. Perfeito para documentação de conclusão de estudos.'
  }
]

export function getTemplateById(id: SummaryTemplateId): SummaryTemplate | undefined {
  return SUMMARY_TEMPLATES.find((template) => template.id === id)
}
