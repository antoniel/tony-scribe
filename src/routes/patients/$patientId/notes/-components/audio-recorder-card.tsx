import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Mic } from 'lucide-react'
import { useState } from 'react'
import { AudioRecorder } from './audio-recorder'

interface AudioRecorderCardProps {
  audioPath?: string | null
  isUploading?: boolean
  isPending?: boolean
  onAudioFile: (file: File) => Promise<void>
  onAudioDelete: () => Promise<void>
}

export function AudioRecorderCard({ audioPath, isUploading = false, isPending = false, onAudioFile, onAudioDelete }: AudioRecorderCardProps) {
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(!!audioPath || isUploading)

  return (
    <Collapsible open={isAudioRecorderOpen} onOpenChange={setIsAudioRecorderOpen}>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-700/30 transition-colors -mx-6 -my-6 px-6 py-6 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Gravação de Áudio
              </CardTitle>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isAudioRecorderOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <AudioRecorder
              disabled={isPending}
              onAudioFile={onAudioFile}
              onAudioDelete={onAudioDelete}
              isUploading={isUploading}
              audioPath={audioPath || undefined}
              noCard={true}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
