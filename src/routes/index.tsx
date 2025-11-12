import { CreateNoteButton } from '@/components/CreateNoteButton'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import { usePatientsWithStats } from '@/hooks'
import { formatDate } from '@/lib/date-utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BookOpen, Brain, Mic, Plus, Sparkles, TrendingUp, Zap } from 'lucide-react'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <PatientRoster />
      </main>
    </div>
  )
}

function HeroSection() {
  return (
    <div className="mb-12 text-center py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-lime-500/10 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300 font-medium">Notas Inteligentes com IA</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent leading-tight">
          Transforme Áudio em
          <br />
          Conhecimento
        </h1>
        
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Grave suas aulas, palestras e estudos. Nossa IA transcreve e gera resumos automáticos para você focar no que importa: aprender.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/50 px-8"
          >
            <Link to="/patients/new" className="inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Criar Novo Estudo
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
          >
            <Link to="/patients" className="inline-flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Meus Estudos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Gravação de Áudio",
      description: "Grave suas aulas e palestras diretamente no navegador",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA Inteligente",
      description: "Transcrição automática e resumos gerados por IA",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Rápido e Fácil",
      description: "Interface intuitiva para estudantes modernos",
      color: "from-lime-500 to-green-500"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {features.map((feature, index) => (
        <Card 
          key={index}
          className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 hover:transform hover:scale-105"
        >
          <CardPanel className="p-6">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 text-sm">{feature.description}</p>
          </CardPanel>
        </Card>
      ))}
    </div>
  )
}

function PatientRoster() {
  const navigate = useNavigate()
  const { data: patients, isLoading } = usePatientsWithStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Meus Estudos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700/50">
              <CardPanel className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-slate-700/50 rounded animate-pulse" />
                  <div className="h-4 bg-slate-700/50 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-slate-700/50 rounded w-1/2 animate-pulse" />
                </div>
              </CardPanel>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!patients || patients.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardPanel className="p-12 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 mb-6">
            <BookOpen className="w-12 h-12 text-emerald-400" />
          </div>
          <p className="text-slate-300 text-lg mb-6">Nenhum estudo encontrado. Crie seu primeiro estudo para começar!</p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/50"
          >
            <Link to="/patients/new" className="inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Criar Primeiro Estudo
            </Link>
          </Button>
        </CardPanel>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-400" />
            Meus Estudos
          </h2>
          <p className="text-slate-400 mt-2">Selecione um estudo para visualizar ou criar notas</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/50"
        >
          <Link to="/patients/new" className="inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Estudo
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <Card
            key={patient.id}
            className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer group hover:transform hover:scale-105"
            onClick={() => navigate({ to: '/patients/$patientId/notes', params: { patientId: patient.id } })}
          >
            <CardPanel className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                    {patient.name}
                    <Sparkles className="w-4 h-4 text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Criado em: {formatDate(new Date(patient.dateOfBirth))}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total de Notas</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        {patient.notesCount}
                      </p>
                    </div>
                  </div>
                  {patient.lastNoteDate && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Última Nota</p>
                      <p className="text-sm text-slate-300">{formatDate(new Date(patient.lastNoteDate))}</p>
                    </div>
                  )}
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <CreateNoteButton 
                    patientId={patient.id} 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Nota
                  </CreateNoteButton>
                </div>
              </div>
            </CardPanel>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StatsBar() {
  const { data: patients } = usePatientsWithStats()

  const totalPatients = patients?.length || 0
  const totalNotes = patients?.reduce((sum, p) => sum + p.notesCount, 0) || 0

  return (
    <div className="grid grid-cols-2 gap-6 mb-12">
      <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-500/30 backdrop-blur-sm hover:border-emerald-400/50 transition-all duration-300">
        <CardPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-300">Total de Estudos</p>
              <p className="text-3xl font-bold text-white">{totalPatients}</p>
            </div>
          </div>
        </CardPanel>
      </Card>
      <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300">
        <CardPanel className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Sparkles className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-300">Total de Notas</p>
              <p className="text-3xl font-bold text-white">{totalNotes}</p>
            </div>
          </div>
        </CardPanel>
      </Card>
    </div>
  )
}
