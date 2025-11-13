import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardPanel, CardTitle } from '@/components/ui/card'
import { LiveWaveform } from '@/components/ui/live-waveform'
import { MicSelector } from '@/components/ui/mic-selector'
import { Loader, Mic, Music, Pause, Play, Square, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface AudioRecorderProps {
  onAudioFile?: (file: File) => void
  onTranscription?: (text: string) => void
  onAudioDelete?: () => void
  disabled?: boolean
  isUploading?: boolean
  audioPath?: string
  noCard?: boolean
}

export function AudioRecorder({ onAudioFile, disabled, isUploading, audioPath, onAudioDelete, noCard = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [selectedDevice, setSelectedDevice] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const previousAudioPathRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  useEffect(() => {
    if (audioPath && !isLoadingAudio) {
      const audioPathChanged = previousAudioPathRef.current !== audioPath

      const hasLocalBlob = audioUrl && audioUrl.startsWith('blob:')
      const shouldLoad = !audioUrl || (audioPathChanged && !hasLocalBlob)

      if (shouldLoad) {
        previousAudioPathRef.current = audioPath
        setIsLoadingAudio(true)
        const loadAudioFromPath = async () => {
          try {
            if (audioUrl) {
              if (audioUrl.startsWith('blob:')) {
                URL.revokeObjectURL(audioUrl)
              }
              setAudioUrl(null)
              setSelectedFile(null)
            }

            const response = await fetch(`/api/notes/audio/${encodeURIComponent(audioPath)}`)

            if (response.ok) {
              const data = await response.json()
              if (data.url) {
                setAudioUrl(data.url)
                const fileName = audioPath.split('/').pop() || 'audio.webm'
                const file = new File([], fileName, { type: 'audio/webm' })
                setSelectedFile(file)
              } else {
                console.error('Falhou to get signed URL:', data.error)
              }
            } else {
              console.error('Falhou to load audio:', response.statusText)
            }
          } catch (error) {
            console.error('Error loading audio from path:', error)
          } finally {
            setIsLoadingAudio(false)
          }
        }
        loadAudioFromPath()
      } else if (audioPathChanged) {
        previousAudioPathRef.current = audioPath
      }
    }
  }, [audioPath])

  useEffect(() => {
    if (!audioPath && audioUrl && previousAudioPathRef.current) {
      previousAudioPathRef.current = undefined
      if (audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(null)
      setSelectedFile(null)
    }
  }, [audioPath, audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      streamRef.current = stream

      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg'
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      setRecordingDuration(0)

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          console.warn('Sem áudio data recorded')
          return
        }

        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        const file = new File([blob], `recording-${Date.now()}.webm`, { type: mimeType })
        setSelectedFile(file)
        onAudioFile?.(file)

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      mediaRecorder.start(100)
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      onAudioFile?.(file)
    }
  }

  const clearRecording = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setSelectedFile(null)
    setRecordingDuration(0)

    if (audioPath && onAudioDelete) {
      onAudioDelete()
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const hasSalvardAudio = !!audioPath && !!audioUrl

  const content = (
    <div className="space-y-6">
      {isUploading || isLoadingAudio ? (
        <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg border border-border">
          <Loader className="w-5 h-5 animate-spin text-accent" />
          <span className="text-sm text-foreground">{isUploading ? 'Uploading audio...' : 'Carregando audio...'}</span>
        </div>
      ) : (
        <>
          {hasSalvardAudio ? (
            <AudioPlayback audioUrl={audioUrl} fileName={selectedFile?.name} onClear={clearRecording} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <MicSelector value={selectedDevice} onValueChange={setSelectedDevice} muted={isMuted} onMutedChange={setIsMuted} />
              </div>

              <RecordingInterface
                isRecording={isRecording}
                duration={recordingDuration}
                formatDuration={formatDuration}
                onStart={startRecording}
                onStop={stopRecording}
              />

              {audioUrl && <AudioPlayback audioUrl={audioUrl} fileName={selectedFile?.name} onClear={clearRecording} />}

              <FileUploadSection disabled={disabled || isRecording || isUploading || isLoadingAudio} onFileUpload={handleFileUpload} />
            </>
          )}
        </>
      )}
    </div>
  )

  if (noCard) {
    return content
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Gravação de Áudio</CardTitle>
      </CardHeader>
      <CardPanel className="space-y-6">{content}</CardPanel>
    </Card>
  )
}

function RecordingInterface({
  isRecording,
  duration,
  formatDuration,
  onStart,
  onStop
}: {
  isRecording: boolean
  duration: number
  formatDuration: (s: number) => string
  onStart: () => void
  onStop: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isRecording ? (
            <Button type="button" onClick={onStop} size="lg" variant="destructive">
              <Square className="w-5 h-5 mr-2 fill-current" />
              Parar Gravação
            </Button>
          ) : (
            <Button type="button" onClick={onStart} size="lg" variant="default">
              <Mic className="w-5 h-5 mr-2" />
              Iniciar Gravação
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 text-foreground">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="font-mono text-lg font-semibold">{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      <LiveWaveform
        active={isRecording}
        height={96}
        barWidth={3}
        barGap={2}
        mode="static"
        fadeEdges={false}
        barColor="#06b6d4"
        historySize={150}
        className="rounded-lg bg-muted/30 border border-border"
      />
    </div>
  )
}

function AudioPlayback({ audioUrl, fileName, onClear }: { audioUrl: string; fileName?: string; onClear: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.load()

    const updateTime = () => {
      if (audio.currentTime !== undefined && !isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime)
      }
    }

    const updateDuration = () => {
      if (audio.duration !== undefined && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
        setIsLoaded(true)
      }
    }

    const handleCanPlay = () => {
      if (audio.duration !== undefined && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
        setIsLoaded(true)
      }
    }

    const handleDurationChange = () => {
      if (audio.duration !== undefined && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
        setIsLoaded(true)
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('play', () => setIsPlaying(true))
      audio.removeEventListener('pause', () => setIsPlaying(false))
      audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && duration > 0) {
      const newTime = (parseFloat(e.target.value) / 100) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-base truncate overflow-hidden text-ellipsis whitespace-nowrap">{fileName || 'Gravação de áudio'}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatTime(currentTime)} / {isLoaded ? formatTime(duration) : '--:--'}
              </p>
            </div>
          </div>
          <Button type="button" variant="destructive-outline" size="sm" onClick={onClear}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardPanel className="space-y-4 pt-0">
        {/* Custom audio controls */}
        <div className="flex items-center gap-3">
          <Button type="button" variant="default" size="lg" onClick={togglePlayPause} className="rounded-full w-12 h-12 p-0 shrink-0">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>

          {/* Progress bar */}
          <div className="flex-1 space-y-1">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleProgressChange}
                disabled={!isLoaded || duration === 0}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-primary 
                  [&::-webkit-slider-thumb]:border-2 
                  [&::-webkit-slider-thumb]:border-background 
                  [&::-webkit-slider-thumb]:shadow-sm
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                  [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-primary 
                  [&::-moz-range-thumb]:border-2 
                  [&::-moz-range-thumb]:border-background 
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-track]:bg-muted [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-lg"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%, hsl(var(--muted)) 100%)`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{isLoaded ? formatTime(duration) : '--:--'}</span>
            </div>
          </div>
        </div>

        {/* Hidden audio element for actual playback */}
        <audio ref={audioRef} src={audioUrl} className="hidden" />
      </CardPanel>
    </Card>
  )
}

function FileUploadSection({ disabled, onFileUpload }: { disabled?: boolean; onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">Or upload file</span>
        </div>
      </div>

      <label
        htmlFor="audioFileUpload"
        className={`
          flex flex-col items-center justify-center w-full h-28
          border-2 border-border border-dashed rounded-lg
          cursor-pointer bg-muted/20
          hover:bg-muted/40 hover:border-accent/50
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center py-4">
          <Upload className="w-7 h-7 mb-2 text-accent" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Click to upload</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">MP3, WAV, WEBM</p>
        </div>
        <input id="audioFileUpload" type="file" className="hidden" accept="audio/*" onChange={onFileUpload} disabled={disabled} />
      </label>
    </div>
  )
}
