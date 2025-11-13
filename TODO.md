# TODO - Anota.ai: Caderno Inteligente de Aulas (UFBA)

## 📋 Equipe e Responsabilidades

### Antoniel
- Backend (Tanstack Start + Hono)
- Integração com APIs de IA (Whisper, Gemini)
- Banco de Dados (PostgreSQL + Drizzle ORM)
- Serviços de transcrição e geração de conteúdo

### Luis Sena
- Frontend (React/Tanstack Start)
- Design de Interface
- Experiência do Usuário (UX)
- Componentes visuais e interativos

### Claudio
- Infraestrutura e Deploy
- Integração de Áudio/Transcrição
- Configuração de servidores
- CI/CD

### João Leahy
- Testes (unitários e integração)
- Documentação técnica
- Features de Colaboração
- Quality Assurance

---

## 🎯 Sprint Atual

### Sprint 1: Fundação e Protótipo Inicial

#### ✅ Concluído
- [x] Setup inicial do projeto (Tanstack Start + Hono)
- [x] Configuração do banco de dados PostgreSQL
- [x] Estrutura básica de componentes UI
- [x] Sistema de roteamento (TanStack Router)
- [x] Integração com editor TipTap

#### 🚧 Em Progresso
- [ ] Sistema de autenticação (SSO UFBA)
- [ ] Integração com API Whisper para transcrição
- [ ] Interface de captura de áudio
- [ ] Upload de slides/PDFs

#### 📝 Pendente
- [ ] Implementação do OCR para slides
- [ ] Sistema de sincronização áudio-slides
- [ ] Linha do tempo interativa
- [ ] Geração de resumos com Gemini API

---

## 🚀 Features Principais

### 1. Captura de Aula
- [ ] Gravação de áudio em tempo real
- [ ] Upload de arquivos (PDF, imagens)
- [ ] Sincronização automática
- [ ] Metadata da aula (disciplina, data, professor)

### 2. Transcrição e Processamento
- [ ] Integração com Whisper/WhisperX
- [ ] Diarização de falas (professor vs estudantes)
- [ ] OCR de slides e imagens
- [ ] Sincronização timeline

### 3. Inteligência Artificial
- [ ] Geração de resumos automáticos
- [ ] Criação de flashcards
- [ ] Geração de questões (objetivas e discursivas)
- [ ] Busca semântica

### 4. Interface e Visualização
- [ ] Editor de anotações (TipTap)
- [ ] Player de áudio sincronizado
- [ ] Linha do tempo interativa
- [ ] Visualização de slides

### 5. Colaboração
- [ ] Compartilhamento com colegas
- [ ] Permissões para monitores
- [ ] Anotações colaborativas
- [ ] Comentários e marcações

### 6. Autenticação e Segurança
- [ ] SSO com UFBA
- [ ] Controle de acesso
- [ ] Privacidade de dados
- [ ] Criptografia de conteúdo sensível

---

## 🐛 Bugs Conhecidos

- [ ] [BAIXA] Performance do editor em notas muito longas
- [ ] [MÉDIA] Sincronização de áudio pode desalinhar em alguns casos

---

## 📚 Documentação

### Pendente
- [ ] README.md completo com instruções de setup
- [ ] Documentação de APIs
- [ ] Guia de contribuição
- [ ] Diagramas de arquitetura
- [ ] Manual do usuário

### Concluído
- [x] TODO.md (este arquivo)
- [x] Apresentação inicial do projeto

---

## 🎓 Entregas Acadêmicas

### Entrega 1: Protótipo Inicial
- [ ] Sistema funcional hospedado
- [ ] Código no GitHub (compartilhado com professor)
- [ ] Apresentação do front-end
- [ ] Demonstração do framework React
- [ ] Duração: máximo 30 minutos

### Requisitos de Apresentação
- [x] Documentação mínima (TODO.md)
- [x] Funções e responsabilidades da equipe
- [ ] Demonstração prática do React
- [ ] Apresentação de componentes e hooks
- [ ] Sistema em produção

---

## 🔧 Tecnologias Utilizadas

### Full-Stack Framework
- Tanstack Start (React)
- TypeScript
- TailwindCSS
- Shadcn/ui
- TanStack Router
- TanStack Query
- TipTap Editor

### Backend
- Hono (Web Framework)
- PostgreSQL
- Drizzle ORM
- OAuth2/SAML (SSO UFBA)

### IA e Processamento
- Whisper/WhisperX (Transcrição)
- Google Gemini API (Resumos, flashcards, questões)
- OCR (Tesseract ou similar)

### Infraestrutura
- Docker
- Docker Compose
- GitHub Actions (CI/CD)
- Cloudflare R2 (Storage)

---

## 📝 Decisões Técnicas

### 2025-11-12: Escolha do Framework
- **Decisão:** Utilizar Tanstack Start (React full-stack) com Hono
- **Motivo:** Type-safety end-to-end, ecossistema rico, SSR, performance moderna
- **Alternativas consideradas:** Next.js, Remix, Vue.js, Svelte

### 2025-11-12: ORM e Banco de Dados
- **Decisão:** PostgreSQL com Drizzle ORM
- **Motivo:** Tipagem forte, performance, migrations robustas
- **Alternativas consideradas:** Prisma, TypeORM

### 2025-11-12: Ferramenta de Gestão
- **Decisão:** TODO.md no repositório
- **Motivo:** Simplicidade, versionamento junto com o código
- **Alternativas consideradas:** Trello, Jira, GitHub Projects

---

## 📅 Timeline

- **Semana 1-2:** Setup e configuração inicial ✅
- **Semana 3-4:** Features básicas de captura e transcrição 🚧
- **Semana 5-6:** Integração com IA e geração de conteúdo
- **Semana 7-8:** Interface e UX
- **Semana 9-10:** Colaboração e compartilhamento
- **Semana 11-12:** Testes, refinamento e preparação para entrega

---

## 🎯 Próximos Passos

1. **Antoniel:** Integrar Whisper API para transcrição
2. **Luis Felipe:** Criar interface de captura de áudio
3. **Claudio:** Configurar ambiente de deploy
4. **João:** Escrever testes para módulos existentes

---

## 📞 Contato

- **Repositório:** [GitHub - tony-scribe](https://github.com/antonielmagalhaes/tony-scribe)
- **Reuniões:** Semanais (definir horário)
- **Canal de Comunicação:** [Definir - Slack/Discord/Telegram]

---

**Última atualização:** 12/11/2025
**Versão:** 1.0

