import { openai } from '@ai-sdk/openai'
import { experimental_transcribe as transcribe } from 'ai'

export async function transcribeAudio(
  audio: Buffer | Uint8Array | string | URL
): Promise<{ text: string; segments: { text: string; start: number; end: number }[] }> {
  try {
    const modelInstance = openai.transcription('whisper-1')

    const result = await transcribe({
      model: modelInstance,
      audio
    })

    return {
      text: result.text,
      segments: result.segments.map((segment) => ({
        text: segment.text,
        start: segment.startSecond,
        end: segment.endSecond
      }))
    }
  } catch (error) {
    throw new Error(`Audio transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function isValidAudioFormat(filename: string): boolean {
  const validExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm']
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'))
  return validExtensions.includes(ext)
}

export function getSupportedFormats(): string {
  return 'mp3, mp4, mpeg, mpga, m4a, wav, webm'
}

export function isValidAudioSize(sizeInBytes: number, maxSizeInMB: number = 25): boolean {
  return sizeInBytes <= maxSizeInMB * 1024 * 1024
}
