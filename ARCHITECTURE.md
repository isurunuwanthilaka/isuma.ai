# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Candidate   │  │  Recruiter   │  │    Admin     │          │
│  │    Pages     │  │  Dashboard   │  │   Dashboard  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                       │
│                    ┌──────▼──────┐                               │
│                    │ API Routes  │                               │
│                    └──────┬──────┘                               │
└───────────────────────────┼───────────────────────────────────  ┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
   │ Prisma  │         │   AI    │        │  File   │
   │   ORM   │         │ Service │        │ Storage │
   └────┬────┘         └────┬────┘        └─────────┘
        │                   │
   ┌────▼────┐         ┌────▼────┐
   │Database │         │   LLM   │
   │Postgres │         │ OpenAI/ │
   │   or    │         │ Ollama  │
   │ SQLite  │         └─────────┘
   └─────────┘
```

## Component Architecture

### Frontend Pages

1. **Home Page** (`/`)
   - Landing page with platform overview
   - Links to Apply and Login

2. **Application Page** (`/applications/new`)
   - Job application form
   - CV upload with drag-and-drop
   - Form validation
   - Calls `/api/applications` POST

3. **Test Interface** (`/test/[sessionId]`)
   - Full-screen coding environment
   - Real-time timer with warnings
   - Anti-cheating features:
     - Copy/paste prevention
     - Tab switch detection
     - Camera snapshots (every 2 min)
   - Code editor (textarea)
   - Submit functionality

4. **Recruiter Dashboard** (`/dashboard`)
   - View all applications
   - Filter by status
   - AI scores display
   - Quick actions

5. **Admin Panel** (`/admin`)
   - Detailed application review
   - CV analysis results
   - Test session viewing
   - Status management

6. **Problem Management** (`/admin/problems`)
   - CRUD operations for coding problems
   - Test case management
   - Difficulty settings

### API Routes

#### Applications
- `POST /api/applications` - Submit application
- `GET /api/admin/applications` - List applications
- `PATCH /api/admin/applications` - Update status

#### Problems
- `GET /api/admin/problems` - List problems
- `POST /api/admin/problems` - Create problem
- `PATCH /api/admin/problems/[id]` - Update problem
- `DELETE /api/admin/problems/[id]` - Delete problem

#### Test Sessions
- `GET /api/test/[sessionId]` - Get test data
- `POST /api/test/[sessionId]/submit` - Submit solution
- `POST /api/test/cheating` - Log cheating event
- `POST /api/test/snapshot` - Upload camera snapshot

### Database Schema

```prisma
User
├─ id, email, name, password
├─ role (candidate/recruiter/admin)
└─ relations: applications[], testSessions[], createdProblems[]

Application
├─ id, position, cvUrl, cvAnalysis
├─ status (pending/reviewing/interview/rejected/accepted)
└─ relations: user, testSessions[]

CodingProblem
├─ id, title, description
├─ difficulty, timeLimit
├─ testCases (JSON), starterCode
└─ relations: creator, testSessions[]

TestSession
├─ id, startTime, endTime
├─ timeRemaining, submittedCode
├─ status, score
└─ relations: user, application, problem, cheatingLogs[], cameraSnapshots[]

CheatingLog
├─ id, eventType
├─ timestamp, metadata
└─ relation: session

CameraSnapshot
├─ id, imageUrl
├─ aiAnalysis, flagged
└─ relation: session
```

### AI Integration Layer

```typescript
LLMClient (lib/ai/llm-client.ts)
├─ Supports: OpenAI & Ollama
├─ Methods:
│  ├─ chat() - Text completion
│  └─ analyzeImage() - Vision analysis
└─ Configuration:
   ├─ LLM_PROVIDER env variable
   ├─ OpenAI: OPENAI_API_KEY
   └─ Ollama: OLLAMA_BASE_URL, OLLAMA_MODEL

CVAnalyzer (lib/ai/cv-analyzer.ts)
└─ Uses LLMClient to extract:
   ├─ Skills
   ├─ Experience years
   ├─ Education
   ├─ Strengths/weaknesses
   └─ Fit score (0-100)
```

## Data Flow

### Application Submission Flow

```
1. Candidate fills form → /applications/new
2. Upload CV file
3. Submit → POST /api/applications
4. Backend:
   a. Create/find user
   b. Hash password
   c. Save CV file to /uploads
   d. Parse CV (PDF/DOCX → text)
   e. Call AI to analyze CV
   f. Store application + analysis
5. Return success
```

### Coding Test Flow

```
1. Admin assigns problem to candidate
2. Create TestSession in DB
3. Candidate opens /test/[sessionId]
4. Page loads:
   a. Fetch problem details
   b. Request camera permission
   c. Start timer
   d. Start camera snapshots (every 2 min)
   e. Attach event listeners
5. During test:
   a. Monitor copy/paste/tab switches
   b. Log to /api/test/cheating
   c. Upload snapshots to /api/test/snapshot
   d. Call AI to analyze snapshots
6. Submit or timeout:
   a. POST /api/test/[sessionId]/submit
   b. Save code + timestamp
   c. Calculate score
   d. Update status
```

### AI Analysis Flow

```
CV Analysis:
1. Parse document → extract text
2. Send to LLM with structured prompt
3. LLM returns JSON:
   {
     skills: string[],
     experience_years: number,
     education: string[],
     strengths: string[],
     weaknesses: string[],
     overall_fit_score: number
   }
4. Store as JSON string in DB

Camera Analysis:
1. Capture image from webcam
2. Convert to base64
3. Upload to /api/test/snapshot
4. Backend:
   a. Save image to /uploads/snapshots
   b. Call LLM with vision prompt
   c. Analyze for suspicious behavior
   d. Store analysis + flag if needed
```

## Security Features

1. **Password Hashing**: bcryptjs with salt
2. **File Sanitization**: Clean filenames, validate types
3. **SQL Injection Prevention**: Prisma ORM
4. **XSS Prevention**: React auto-escaping
5. **CSRF**: Next.js built-in protection
6. **Rate Limiting**: To be added (recommended: next-rate-limit)

## Deployment Architecture

### Local Development
```
Developer Machine
├─ SQLite database
├─ Ollama (local LLM)
├─ Next.js dev server
└─ File storage: /uploads
```

### Production (Vercel + Supabase)
```
Vercel (Serverless)
├─ Next.js app
├─ API routes
└─ Edge functions

Supabase
├─ PostgreSQL database
├─ File storage (Supabase Storage)
└─ Realtime (optional)

OpenAI
└─ GPT-4o-mini API
```

## Performance Considerations

1. **Database Queries**: Indexed on frequently queried fields
2. **Image Storage**: Consider CDN for snapshots
3. **LLM Calls**: Cache results when possible
4. **File Uploads**: Stream large files, don't buffer
5. **Real-time Updates**: Consider WebSockets for test timer

## Scalability

### Current Limitations
- SQLite: Single file, not scalable
- Local file storage: Not distributed
- Serverless limits: 4.5MB request size on Vercel

### Scaling Solutions
- Use PostgreSQL (Supabase)
- Use cloud storage (S3, Supabase Storage, Vercel Blob)
- Consider Redis for caching
- Use queue for AI processing (BullMQ, Inngest)
- Implement rate limiting

## Future Enhancements

1. **Authentication**: NextAuth with Google/GitHub OAuth
2. **Real-time Collaboration**: Share screen during interviews
3. **Video Recording**: Full session recording
4. **Advanced Analytics**: Candidate performance dashboards
5. **Email Notifications**: Application status updates
6. **Scheduling**: Integrated calendar for interviews
7. **Code Execution**: Run and test submitted code
8. **Plagiarism Detection**: Compare with known solutions
9. **Mobile App**: React Native for mobile testing
10. **Webhooks**: Integration with ATS systems
