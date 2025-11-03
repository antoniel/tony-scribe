## Overview

This application simulates a core component of a home healthcare compliance suite, demonstrating:

- Patient record management with seeded mock data
- Audio transcription using OpenAI Whisper
- AI-generated clinical summaries in SOAP, Progress Note, and Discharge Summary formats
- Modern, type-safe full-stack architecture with React and Node.js
- Production-grade features including cloud storage (Cloudflare R2) and real-time audio recording

## Tech Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Hono (lightweight, Express-like API framework)
- **Database**: PostgreSQL with Drizzle ORM
- **AI Services**: OpenAI (Whisper for transcription, GPT-4.1 for summarization)
- **Storage**: Cloudflare R2 (S3-compatible) for audio files
- **Validation**: Zod schemas with runtime validation

### Frontend

- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router (file-based routing)
- **State Management**: TanStack Query for server state
- **Rich Text Editor**: TipTap (ProseMirror-based)
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Audio Recording**: Browser MediaRecorder API with live waveform visualization

### Infrastructure

- **Containerization**: Docker Compose for PostgreSQL
- **Build Tool**: Vite with TanStack Start SSR capabilities
- **Database Migrations**: Drizzle Kit

## Core Features

### 1. Patient Management

- Pre-seeded database with 3 mock patients (João Silva, Maria Santos, Carlos Oliveira)
- Full CRUD operations for patient records
- Patient list view with search and filtering

### 2. Note Creation & Management

- Create notes associated with specific patients
- Rich text editor with formatting options
- Dual input modes: typed text or audio upload/recording
- Real-time audio recording with waveform visualization
- Support for multiple audio formats (mp3, mp4, wav, webm, etc.)

### 3. Audio Transcription

- Automatic transcription using OpenAI Whisper
- Support for audio files up to 25MB
- Timestamped transcription segments
- Manual transcription retry on failure
- Copy transcription to note editor

### 4. AI Summary Generation

- Three clinical note templates:
  - **SOAP Note**: Subjective, Objective, Assessment, Plan
  - **Progress Note**: History, Exam, Assessment, Plan
  - **Discharge Summary**: Admission Diagnosis, Hospital Course, Discharge Condition, Instructions
- Structured output using GPT-4.1 with Zod schemas
- Save and edit generated summaries

### 5. Note Listing & Detail Views

- List all notes with patient information, date, and preview
- Detailed note view with:
  - Raw note content (editable)
  - Transcription panel
  - Audio player with cloud storage
  - AI summary panel
  - Patient metadata sidebar

## Project Structure

```
tony-scribe/
├── src/
│   ├── server/                    # Backend API
│   │   ├── database/             # Drizzle ORM setup and migrations
│   │   │   ├── schema.ts        # Database schema definitions
│   │   │   ├── seed.ts          # Patient seed data
│   │   │   └── drizzle/         # Generated migrations
│   │   ├── modules/             # Feature modules
│   │   │   ├── note/           # Note CRUD, transcription, summary
│   │   │   └── patient/        # Patient CRUD operations
│   │   ├── services/           # External service integrations
│   │   │   ├── ai.service.ts          # OpenAI GPT-4.1 summarization
│   │   │   ├── transcription.service.ts # OpenAI Whisper transcription
│   │   │   └── r2-storage.service.ts    # Cloudflare R2 storage
│   │   └── index.ts            # Hono app entry point
│   ├── routes/                  # Frontend pages (TanStack Router)
│   │   ├── index.tsx           # Home/dashboard
│   │   ├── patients/           # Patient list and forms
│   │   └── $patientId/notes/   # Note management pages
│   ├── components/             # Reusable UI components
│   │   └── ui/                # Design system components
│   ├── hooks/                  # React Query hooks
│   └── lib/                    # Utilities and helpers
├── docker-compose.yml          # PostgreSQL container setup
├── drizzle.config.ts          # Database migration config
└── package.json               # Dependencies and scripts
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- OpenAI API key
- Cloudflare R2 account (optional, for audio storage)

### 1. Clone and Install

```bash
git clone https://github.com/antoniel/tony-scribe
cd tony-scribe
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the following environment variables:

```env
# Database (default for local Docker setup)
DATABASE_URL=postgresql://postgres:postgres@localhost:51143/tony_scribe

# OpenAI API Key (required for transcription and summarization)
OPENAI_API_KEY=sk-your-actual-api-key-here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudflare R2 (required for audio storage)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=tony-scribe-audio
```

**Important**: You must provide a valid OpenAI API key and Cloudflare R2 credentials for the application to work properly.

### 3. Start PostgreSQL Database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container on port `51143` with:

- Username: `postgres`
- Password: `postgres`
- Database: `tony_scribe`

### 4. Run Database Migrations

```bash
npm run migration:run
```

This creates the required tables (`patients` and `notes`).

### 5. Seed the Database

```bash
npx tsx src/server/database/seed.ts
```

This populates the database with 3 mock patients:

- João Silva (DOB: 1980-05-15)
- Maria Santos (DOB: 1992-08-22)
- Carlos Oliveira (DOB: 1975-03-10)

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 7. Verify Setup

1. Navigate to `http://localhost:3000`
2. Click on "Patients" to see the seeded patient list
3. Select a patient and create a new note
4. Try audio recording or text input
5. Generate a SOAP note summary

## API Documentation

### Base URL

`http://localhost:3000/api`

### Endpoints

#### Patients

- `GET /patients` - List all patients
- `GET /patients/:id` - Get patient by ID
- `POST /patients` - Create new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

#### Notes

- `GET /notes?patientId=:patientId` - Get notes for a patient
- `GET /notes/:id` - Get note by ID
- `POST /notes` - Create new note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `POST /notes/:id/transcribe` - Transcribe audio for a note
- `POST /notes/:id/generate-summary` - Generate AI summary
- `POST /notes/transcribe` - Upload and transcribe audio file
- `GET /notes/audio/:key` - Get signed URL for audio playback

### Example Requests

#### Create a Note

```bash
POST /api/notes
Content-Type: application/json

{
  "patientId": "pat_abc123",
  "name": "Initial Consultation",
  "rawContent": "Patient presents with fever and cough..."
}
```

#### Generate SOAP Summary

```bash
POST /api/notes/:id/generate-summary
Content-Type: application/json

{
  "template": "soap"
}
```

## Architecture Decisions

### Backend Patterns

1. **Result Type Pattern**: All service functions return `Result<T, E>` type for explicit error handling
2. **Modular Architecture**: Features organized into self-contained modules (note, patient)
3. **Schema Validation**: Zod schemas for both runtime validation and TypeScript types
4. **Type-Safe ORM**: Drizzle ORM provides end-to-end type safety from database to API

### Frontend Patterns

1. **File-Based Routing**: TanStack Router auto-generates routes from file structure
2. **Server State Management**: TanStack Query handles all API data fetching, caching, and mutations
3. **Component Decomposition**: Large components broken into smaller, focused subcomponents
4. **Context for Cross-Cutting Concerns**: Summary generation state managed via React Context

### AI Integration Strategy

1. **Structured Output**: Using Vercel AI SDK's `generateObject` with Zod schemas for reliable structured data
2. **Template-Based Generation**: Three specialized clinical note formats instead of generic summaries
3. **Graceful Degradation**: Transcription failures don't block audio upload; summaries work with partial data

## Assumptions & Shortcuts

### Development Assumptions

1. **Mock Patient Data**: Seeded with Portuguese names as per developer locale
2. **Audio Storage**: Requires Cloudflare R2 (could be adapted to AWS S3 or local storage)

### Shortcuts Taken

1. **No User Authentication**: Patient data is openly accessible
2. **Basic Audio Format Support**: Limited to OpenAI Whisper-supported formats
3. **Simple UI/UX**: Focus on functionality over polished design

## Development Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run serve            # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run check            # Format and fix lint errors
npm run tscheck          # TypeScript type checking

# Database
npm run migration:gen    # Generate new migration
npm run migration:run    # Apply migrations
npm run migration:drop   # Drop last migration

# Testing
npm test                 # Run test suite (Vitest)
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL container is running
docker ps | grep tony-scribe-postgres

# View container logs
docker logs tony-scribe-postgres

# Restart container
docker compose restart
```
