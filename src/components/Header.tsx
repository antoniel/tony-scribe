import { Link } from '@tanstack/react-router'

import { Database, FileText, Home, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="border-b border-slate-600 bg-slate-900 shadow-lg">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors" aria-label="Open menu">
              <Menu size={24} className="text-slate-300" />
            </button>
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <FileText className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">Tony Scribe</h1>
            </Link>
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navegação</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors" aria-label="Fechar menu">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className: 'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2'
            }}
          >
            <Home size={20} />
            <span className="font-medium">Início</span>
          </Link>

          <div className="border-t border-gray-700 my-4"></div>

          <Link
            to="/patients"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className: 'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2'
            }}
          >
            <Database size={20} />
            <span className="font-medium">Estudantes</span>
          </Link>

          <div className="border-t border-gray-700 my-4"></div>
        </nav>
      </aside>
    </>
  )
}
