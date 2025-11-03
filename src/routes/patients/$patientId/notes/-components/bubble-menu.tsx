import type { Editor } from '@tiptap/react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import { Bold, Code, Heading1, Heading2, Heading3, Italic, Link, Strikethrough } from 'lucide-react'

interface BubbleMenuProps {
  editor: Editor | null
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  if (!editor) return null

  return (
    <TiptapBubbleMenu editor={editor} className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-lg shadow-cyan-500/20">
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        icon={<Heading1 className="h-4 w-4" />}
        title="Heading 1"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        icon={<Heading2 className="h-4 w-4" />}
        title="Heading 2"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        icon={<Heading3 className="h-4 w-4" />}
        title="Heading 3"
      />

      <div className="w-px h-6 bg-slate-700 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        icon={<Bold className="h-4 w-4" />}
        title="Bold"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        icon={<Italic className="h-4 w-4" />}
        title="Italic"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        icon={<Strikethrough className="h-4 w-4" />}
        title="Strikethrough"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        icon={<Code className="h-4 w-4" />}
        title="Code"
      />

      <div className="w-px h-6 bg-slate-700 mx-1" />

      <MenuButton
        onClick={() => {
          const url = window.prompt('URL')
          if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }
        }}
        isActive={editor.isActive('link')}
        icon={<Link className="h-4 w-4" />}
        title="Link"
      />

      <div className="w-px h-6 bg-slate-700 mx-1" />
    </TiptapBubbleMenu>
  )
}

interface MenuButtonProps {
  onClick: () => void
  isActive: boolean
  icon: React.ReactNode
  title: string
}

function MenuButton({ onClick, isActive, icon, title }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
    >
      {icon}
    </button>
  )
}
