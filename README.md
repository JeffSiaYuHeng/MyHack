# MyHack: Build With AI 2026 KL Prototype

MyHack is a hackathon-ready AI prototype scaffold for Build With AI 2026 KL. It combines a deployable Next.js application foundation with a new DualBrain Module that gives the project a structured agentic workflow for planning, coding, evaluation, and archival.

## Project Status

Status: scaffold ready, DualBrain initialized, product feature pending.

The repository is ready for rapid feature implementation once the event topic is released. The application layer is currently a prepared product shell featuring Team MyHack branding, Gemini integration, Firebase persistence hooks, state management, Docker support, and Cloud Run deployment automation.

## Technology Stack

- **Framework**: Next.js 16.2.6 (App Router)
- **UI/Styling**: React 19, Tailwind CSS v4, `shadcn`, `@base-ui/react`
- **Language**: TypeScript
- **Icons & Feedback**: `lucide-react`, `react-hot-toast`
- **AI Integration**: Google Gemini (`@google/generative-ai`)
- **Backend Services**: Firebase Auth and Firestore
- **State Management**: Zustand
- **Deployment & Containerization**: Google Cloud Run, Docker, Docker Compose

## Features

- **Next.js Foundation**: Pre-configured with the latest app router, fully typed.
- **DualBrain Module (`DB_Module/`)**: A Markdown-based agent workflow and memory system that handles long-term project truth (`_DOCS`), future execution strategy (`_PHASES`), active task instructions (`_TASK`), and role-specific agent behaviors.
- **AI Integration**: Ready-to-use Gemini API routes and helper functions.
- **Firebase Ready**: Easy integration with Firestore and Firebase Auth.
- **Dockerized**: Includes `Dockerfile` and `docker-compose.yml` for seamless local dev and deployment.
- **CI/CD setup**: GitHub Actions workflow for automated deployments to Google Cloud Run.

## Getting Started

1. Clone the repository.
2. Ensure you have Node.js and npm installed.
3. Setup environment variables by copying `.env.local.example` to `.env.local` and populating `GEMINI_API_KEY` and Firebase credentials.

```bash
cp .env.local.example .env.local
```

### Local Development

Install dependencies and start the Next.js development server:

```bash
npm install
npm run dev
```

Alternatively, use Docker for local development:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Commands

- `npm run dev`: Start development server
- `npm run build`: Build production application
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run gen:structure`: Generate repository structure documentation
- `npm run gen:graph`: Generate dependency graph documentation
