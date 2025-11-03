import { cn } from '@/lib/utils'
import { Edit2, Loader } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface EditableNoteTitleProps {
  value: string | null
  onSave: (newValue: string) => Promise<void> | void
  className?: string
}

export function EditableNoteTitle({ value, onSave, className }: EditableNoteTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editValue.trim() === value?.trim()) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editValue.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex-1">
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            disabled={isSaving}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-2xl font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
            placeholder="Note name..."
          />
        </div>
        {isSaving && <Loader className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>
    )
  }

  return (
    <div className={cn('group flex items-center gap-2 cursor-pointer', className)} onClick={() => setIsEditing(true)}>
      <h1 className="text-2xl font-semibold text-white">{value || 'Untitled Note'}</h1>
      <Edit2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
