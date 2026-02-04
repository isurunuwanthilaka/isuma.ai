# Isuma.ai - AI-Powered Hiring Platform

![Build Status](https://github.com/isurunuwanthilaka/isuma.ai/workflows/UI%20Build%20Validation/badge.svg)
![PR Checks](https://github.com/isurunuwanthilaka/isuma.ai/workflows/PR%20Checks/badge.svg)

An intelligent hiring platform with AI-powered CV analysis, timed coding assessments, and advanced anti-cheating detection using multimodal AI.

## Features

### 🎯 Smart Application System
- Online job application forms
- CV/Resume upload and parsing
- AI-powered CV analysis using LLMs
- Automated candidate screening

### ⏱️ Timed Coding Tests
- Real-time coding challenges
- Customizable time limits
- Code execution and testing
- Copy/paste blocking
- Tab switch detection

### 🤖 AI-Powered Anti-Cheating
- Camera monitoring with periodic snapshots
- Multimodal LLM analysis of candidate photos
- Browser event tracking (copy, paste, focus loss)
- Behavioral pattern analysis
- Cheating detection logs

### 📊 Admin Dashboard
- Review applications
- Manage coding problems
- View test results
- Analyze cheating detection data

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase) / SQLite (local dev)
- **ORM**: Prisma
- **AI**: OpenAI GPT-4 / Ollama (configurable)
- **Deployment**: Vercel + Supabase

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (for production) or SQLite (for local dev)
- OpenAI API key OR Ollama (for local development)

### Local Development Setup

#### Option 1: With Ollama (No API costs)

1. **Install Ollama**
   ```bash
   # Visit https://ollama.ai to install
   # Then pull required models:
   ollama pull llama3.2
   ollama pull llava  # For vision/image analysis
   ```

2. **Clone and setup**
   ```bash
   git clone https://github.com/isurunuwanthilaka/isuma.ai.git
   cd isuma.ai
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   LLM_PROVIDER="ollama"
   OLLAMA_BASE_URL="http://localhost:11434"
   OLLAMA_MODEL="llama3.2"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

#### Option 2: With OpenAI

1. **Clone and setup**
   ```bash
   git clone https://github.com/isurunuwanthilaka/isuma.ai.git
   cd isuma.ai
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   LLM_PROVIDER="openai"
   OPENAI_API_KEY="your-openai-api-key"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Initialize database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Vercel with Supabase.

Quick summary:
1. Create Supabase project and get DATABASE_URL
2. Push schema: `npx prisma db push`
3. Deploy to Vercel
4. Configure environment variables on Vercel
5. Set up file storage (Supabase Storage or Vercel Blob)

## Project Structure

```
isuma.ai/
├── app/
│   ├── api/              # API routes
│   │   ├── applications/ # Application submission
│   │   └── test/         # Test session APIs
│   ├── applications/     # Application pages
│   ├── test/            # Coding test interface
│   ├── admin/           # Admin dashboard
│   └── dashboard/       # Recruiter dashboard
├── components/          # React components
├── lib/
│   ├── ai/             # AI utilities
│   │   ├── llm-client.ts    # LLM abstraction layer
│   │   └── cv-analyzer.ts   # CV analysis
│   ├── prisma.ts       # Database client
│   └── file-utils.ts   # File upload utilities
├── prisma/
│   └── schema.prisma   # Database schema
└── public/             # Static files
```

## Environment Variables

### Required
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Application URL

### LLM Configuration
- `LLM_PROVIDER` - "openai" or "ollama" (default: "openai")

### For OpenAI
- `OPENAI_API_KEY` - Your OpenAI API key

### For Ollama
- `OLLAMA_BASE_URL` - Ollama server URL (default: http://localhost:11434)
- `OLLAMA_MODEL` - Model for text tasks (default: llama3.2)

## Key Features Implementation

### CV Analysis
The platform uses LLMs to analyze uploaded CVs and extract:
- Skills and technical expertise
- Years of experience
- Education background
- Candidate strengths and weaknesses
- Overall fit score (0-100)

### Anti-Cheating System
- **Copy/Paste Blocking**: Prevents copying code from external sources
- **Tab Switch Detection**: Tracks when candidates leave the test page
- **Camera Monitoring**: Periodic snapshots analyzed by multimodal AI
- **Behavior Analysis**: AI analyzes photos for suspicious behavior
- **Event Logging**: All cheating events logged for review

### Coding Test System
- Customizable coding problems
- Real-time code editor
- Countdown timer
- Automatic submission on timeout
- Code execution and testing

## CI/CD

The project uses GitHub Actions for automated quality checks:

### Automated Workflows

1. **UI Build Validation** - Runs on push to main/develop branches and PRs
   - Tests build on Node.js 18.x and 20.x
   - TypeScript type checking
   - ESLint validation
   - Production build verification
   - Uploads build artifacts

2. **PR Checks** - Quick validation on all pull requests
   - TypeScript type checking
   - Code linting
   - Formatting validation (if configured)

### Running Checks Locally

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

See [.github/workflows/README.md](.github/workflows/README.md) for detailed workflow documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

**Before submitting:**
1. Ensure all CI checks pass locally
2. Run `npm run lint` to check code quality
3. Run `npm run build` to verify build succeeds
4. Update documentation if needed

## License

ISC

## Security

- All uploaded files are sanitized
- Passwords are hashed using bcrypt
- API routes are protected
- Database queries use Prisma ORM (prevents SQL injection)
- CodeQL security scanning enabled

## Support

For issues and questions, please open an issue on GitHub.
