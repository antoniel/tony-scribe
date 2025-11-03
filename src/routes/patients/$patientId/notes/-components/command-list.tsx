import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'

export interface CommandItemProps {
  title: string
  description: string
  icon: React.ReactNode
}

interface CommandListProps {
  items: CommandItemProps[]
  command: (item: CommandItemProps) => void
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="z-50 min-w-[300px] bg-slate-900 border border-slate-700 rounded-lg shadow-lg shadow-cyan-500/20 overflow-hidden">
      {props.items.length > 0 ? (
        <div className="max-h-[400px] overflow-y-auto p-1">
          {props.items.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => selectItem(index)}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg border border-slate-700">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white">{item.title}</div>
                <div className="text-sm text-slate-400 truncate">{item.description}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-slate-400">No results</div>
      )}
    </div>
  )
})

CommandList.displayName = 'CommandList'
