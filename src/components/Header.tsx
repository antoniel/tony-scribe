import { Link } from '@tanstack/react-router'

import { BookOpen, GraduationCap, Home, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="border-b border-emerald-500/20 bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 shadow-lg backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)} 
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105" 
              aria-label="Abrir menu"
            >
              <Menu size={24} className="text-white" />
            </button>
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group">
              <div className="relative">
                <GraduationCap className="w-9 h-9 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
                <Sparkles className="w-4 h-4 text-lime-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent">
                  EduScribe
                </h1>
                <p className="text-xs text-slate-400 -mt-1">Notas Inteligentes</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950/30 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col backdrop-blur-xl border-r border-emerald-500/20 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-emerald-400" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Navegação
            </h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300" 
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-6 overflow-y-auto space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
            activeProps={{
              className: 'flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/50 transition-all duration-300'
            }}
          >
            <Home size={22} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">Início</span>
          </Link>

          <div className="border-t border-emerald-500/20 my-4"></div>

          <Link
            to="/patients"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
            activeProps={{
              className: 'flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/50 transition-all duration-300'
            }}
          >
            <BookOpen size={22} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">Meus Estudos</span>
          </Link>

          <div className="border-t border-emerald-500/20 my-4"></div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-sm text-emerald-300">Dica do Dia</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use a gravação de áudio para capturar suas aulas e gere resumos automáticos com IA!
            </p>
          </div>
        </nav>
      </aside>
    </>
  )
}
