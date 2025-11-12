import { Button } from '@/components/ui/button'
import { useCreateNote } from '@/hooks'
import { useNavigate } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

interface CreateNoteButtonProps {
  patientId: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg' | null | undefined
  className?: string
  children: React.ReactNode
}

export function CreateNoteButton({ patientId, variant = 'default', size = 'default', className = '', children }: CreateNoteButtonProps) {
  const navigate = useNavigate()
  const createNoteMutation = useCreateNote()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    createNoteMutation.mutate(
      {
        studentId: patientId,
        rawContent: ''
      },
      {
        onSuccess: (data) => {
          navigate({
            to: '/patients/$patientId/notes/$noteId',
            params: { patientId, noteId: data.id }
          })
        }
      }
    )
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick} disabled={createNoteMutation.isPending}>
      {createNoteMutation.isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </Button>
  )
}
