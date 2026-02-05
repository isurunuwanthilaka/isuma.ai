# Quick Start Guide

Get the Isuma.ai hiring platform running locally in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- Ollama installed (for local dev) OR OpenAI API key

## Option 1: Quick Start with Ollama (Recommended for Local Development)

### Step 1: Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Or visit https://ollama.ai for other installation methods
```

### Step 2: Pull Required Models

```bash
ollama pull llama3.2      # For text analysis (CV analysis)
ollama pull llava         # For image analysis (camera snapshots)
```

### Step 3: Clone and Setup

```bash
git clone https://github.com/isurunuwanthilaka/isuma.ai.git
cd isuma.ai
npm install
```

### Step 4: Configure Environment

```bash
cp .env.example .env
```

The default `.env` is already configured for Ollama with SQLite!

### Step 5: Initialize Database

```bash
npm run db:push     # Create database schema
npm run db:seed     # Add sample data
```

### Step 6: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 🎉

### Default Credentials

- **Admin**: admin@isuma.ai / admin123
- **Recruiter**: recruiter@isuma.ai / recruiter123

## Option 2: Quick Start with OpenAI

### Step 1: Get OpenAI API Key

Get your API key from https://platform.openai.com/api-keys

### Step 2: Clone and Setup

```bash
git clone https://github.com/isurunuwanthilaka/isuma.ai.git
cd isuma.ai
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="file:./dev.db"
LLM_PROVIDER="openai"
OPENAI_API_KEY="your-api-key-here"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 4: Initialize Database

```bash
npm run db:push
npm run db:seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

## What's Included?

After seeding, you'll have:

- ✅ 1 Admin user (admin@isuma.ai)
- ✅ 1 Recruiter user (recruiter@isuma.ai)
- ✅ 4 Sample coding problems:
  - Two Sum (Easy, 30 min)
  - Reverse String (Easy, 20 min)
  - Valid Palindrome (Medium, 30 min)
  - Merge Sorted Arrays (Medium, 40 min)

## Key Pages

- **/** - Homepage
- **/applications/new** - Job application form
- **/dashboard** - Recruiter dashboard
- **/admin** - Admin panel (view applications)
- **/admin/problems** - Manage coding problems
- **/test/[sessionId]** - Coding test interface (create a test session first)

## Testing the Platform

### 1. Submit a Test Application

1. Go to http://localhost:3000
2. Click "Apply Now"
3. Fill out the form and upload a CV
4. Submit

### 2. Review as Admin

1. Go to http://localhost:3000/admin
2. See the application with AI analysis
3. Update status, view details

### 3. Create a Coding Test

1. Go to http://localhost:3000/admin/problems
2. Create a new problem or use existing ones
3. Assign to a candidate (via API or admin panel)

## Troubleshooting

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama if needed
ollama serve
```

### Database Issues

```bash
# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Build Issues

```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Explore the code in `app/`, `lib/`, and `components/`

## Need Help?

Open an issue on GitHub with:
- Your Node.js version: `node --version`
- Your OS
- Error messages (if any)
- Steps to reproduce

Happy hiring! 🚀
