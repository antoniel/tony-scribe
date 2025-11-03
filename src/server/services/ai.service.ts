import { openai } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'

export type SummaryTemplate = 'soap' | 'progress' | 'discharge'

const soapSchema = z.object({
  subjective: z.string().describe('Patient complaints, symptoms, and history from their perspective'),
  objective: z.string().describe('Observable and measurable findings (vital signs, physical exam, lab results)'),
  assessment: z.string().describe('Clinical diagnosis or professional assessment of the condition'),
  plan: z.string().describe('Treatment plan, medications, follow-up, and next steps')
})

export type SoapNote = z.infer<typeof soapSchema>

const progressNoteSchema = z.object({
  history: z.string().describe('Relevant history including chief complaint, history of present illness, and review of systems'),
  exam: z.string().describe('Physical examination findings and vital signs'),
  assessment: z.string().describe('Clinical assessment and diagnosis'),
  plan: z.string().describe('Treatment plan, medications, and follow-up instructions')
})

export type ProgressNote = z.infer<typeof progressNoteSchema>

const dischargeSummarySchema = z.object({
  admissionDiagnosis: z.string().describe('Primary diagnosis at time of admission'),
  hospitalCourse: z.string().describe('Summary of hospital stay, procedures, treatments, and clinical course'),
  dischargeCondition: z.string().describe('Patient condition at discharge and current status'),
  dischargeInstructions: z.string().describe('Discharge medications, follow-up appointments, and patient instructions')
})

export type DischargeSummary = z.infer<typeof dischargeSummarySchema>

export async function generateSoapSummary(rawContent: string): Promise<SoapNote> {
  try {
    const { object } = await generateObject({
      model: openai('gpt-4.1'),
      schema: soapSchema,
      prompt: `You are a medical documentation specialist. Analyze the following clinical note and structure it into SOAP format (Subjective, Objective, Assessment, Plan).

Clinical Note:
${rawContent}

Extract or infer the relevant information for each SOAP section. If a section has no information, write "Not documented" for that section.`
    })

    return object
  } catch (error) {
    console.error('Error generating SOAP summary:', error)
    throw new Error('Failed to generate AI summary')
  }
}

export async function generateSimpleSummary(rawContent: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4.1'),
      prompt: `Summarize the following clinical note in 2-3 concise sentences, focusing on key patient information, diagnosis, and treatment:

${rawContent}`
    })

    return text
  } catch (error) {
    console.error('Error generating simple summary:', error)
    throw new Error('Failed to generate AI summary')
  }
}

export async function generateProgressNoteSummary(rawContent: string): Promise<ProgressNote> {
  try {
    const { object } = await generateObject({
      model: openai('gpt-4.1'),
      schema: progressNoteSchema,
      prompt: `You are a medical documentation specialist. Analyze the following clinical note and structure it into a Progress Note format (History, Exam, Assessment, Plan).

Clinical Note:
${rawContent}

Extract or infer the relevant information for each section. If a section has no information, write "Not documented" for that section.`
    })

    return object
  } catch (error) {
    console.error('Error generating Progress Note summary:', error)
    throw new Error('Failed to generate AI summary')
  }
}

export async function generateDischargeSummary(rawContent: string): Promise<DischargeSummary> {
  try {
    const { object } = await generateObject({
      model: openai('gpt-4.1'),
      schema: dischargeSummarySchema,
      prompt: `You are a medical documentation specialist. Analyze the following clinical note and structure it into a Discharge Summary format (Admission Diagnosis, Hospital Course, Discharge Condition, Discharge Instructions).

Clinical Note:
${rawContent}

Extract or infer the relevant information for each section. If a section has no information, write "Not documented" for that section.`
    })

    return object
  } catch (error) {
    console.error('Error generating Discharge Summary:', error)
    throw new Error('Failed to generate AI summary')
  }
}

export async function generateSummary(content: string, template: SummaryTemplate): Promise<string> {
  try {
    switch (template) {
      case 'soap': {
        const soap = await generateSoapSummary(content)
        return formatSoapAsText(soap)
      }
      case 'progress': {
        const progress = await generateProgressNoteSummary(content)
        return formatProgressNoteAsText(progress)
      }
      case 'discharge': {
        const discharge = await generateDischargeSummary(content)
        return formatDischargeSummaryAsText(discharge)
      }
      default:
        throw new Error(`Unknown template type: ${template}`)
    }
  } catch (error) {
    console.error(`Error generating summary with template ${template}:`, error)
    throw error instanceof Error ? error : new Error('Failed to generate AI summary')
  }
}

export function formatSoapAsText(soap: SoapNote): string {
  return `SOAP NOTE

Subjective:
${soap.subjective}

Objective:
${soap.objective}

Assessment:
${soap.assessment}

Plan:
${soap.plan}`
}

export function formatProgressNoteAsText(progress: ProgressNote): string {
  return `PROGRESS NOTE

History:
${progress.history}

Exam:
${progress.exam}

Assessment:
${progress.assessment}

Plan:
${progress.plan}`
}

export function formatDischargeSummaryAsText(discharge: DischargeSummary): string {
  return `DISCHARGE SUMMARY

Admission Diagnosis:
${discharge.admissionDiagnosis}

Hospital Course:
${discharge.hospitalCourse}

Discharge Condition:
${discharge.dischargeCondition}

Discharge Instructions:
${discharge.dischargeInstructions}`
}
