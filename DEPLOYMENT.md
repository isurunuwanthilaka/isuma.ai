# Deployment Guide

This guide covers deploying the Isuma.ai hiring platform to Vercel with Supabase.

## Prerequisites

1. [Vercel Account](https://vercel.com)
2. [Supabase Account](https://supabase.com)
3. OpenAI API Key (or use Ollama for local development)

## Step 1: Set Up Supabase Database

1. Create a new Supabase project at https://supabase.com/dashboard
2. Wait for the database to be provisioned
3. Go to **Project Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password

Your connection string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## Step 2: Set Up Database Schema

1. Install dependencies locally:
```bash
npm install
```

2. Update your `.env` file with the Supabase connection string:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

3. Push the Prisma schema to Supabase:
```bash
npx prisma db push
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

### Option B: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 4: Configure Environment Variables on Vercel

Go to your project settings on Vercel and add these environment variables:

### Required Variables:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# NextAuth
NEXTAUTH_SECRET=generate-a-random-secret-using-openssl-rand-base64-32
NEXTAUTH_URL=https://your-app.vercel.app

# LLM Provider
LLM_PROVIDER=openai

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 5: Configure File Storage

By default, files are stored locally which won't work on Vercel (serverless).

### Option A: Use Supabase Storage

1. Enable Storage in Supabase dashboard
2. Create a bucket called `uploads`
3. Update `lib/file-utils.ts` to use Supabase Storage SDK
4. Add environment variable:
```env
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Option B: Use Vercel Blob Storage

1. Enable Vercel Blob in your project settings
2. Install Vercel Blob SDK:
```bash
npm install @vercel/blob
```
3. Update `lib/file-utils.ts` to use Vercel Blob
4. Vercel automatically provides `BLOB_READ_WRITE_TOKEN`

## Step 6: Verify Deployment

1. Visit your Vercel deployment URL
2. Test the application form
3. Check Supabase dashboard for data

## Local Development vs Production

### Local Development with Ollama

For local development without OpenAI costs:

1. Install Ollama: https://ollama.ai
2. Pull models:
```bash
ollama pull llama3.2
ollama pull llava  # For vision tasks
```

3. Update `.env`:
```env
DATABASE_URL="file:./dev.db"  # SQLite for local dev
LLM_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2"
```

4. Run migrations:
```bash
npx prisma db push
```

5. Start dev server:
```bash
npm run dev
```

### Production with OpenAI

Use OpenAI in production for better reliability:

```env
LLM_PROVIDER="openai"
OPENAI_API_KEY="your-openai-api-key"
```

## Troubleshooting

### Database Connection Issues
- Verify your Supabase password is correct
- Check that your IP is allowed (Supabase allows all by default)
- Ensure the connection string format is correct

### File Upload Issues on Vercel
- Vercel has a 4.5MB limit for serverless functions
- Use Vercel Blob or Supabase Storage for file uploads
- Consider using client-side upload to storage

### LLM Issues
- For Ollama: Ensure Ollama server is running locally
- For OpenAI: Verify API key is valid and has credits
- Check logs in Vercel dashboard for detailed errors

## Monitoring

- View logs in Vercel Dashboard
- Monitor database usage in Supabase Dashboard
- Set up error tracking with Sentry (optional)

## Scaling Considerations

- **Database**: Supabase free tier supports up to 500MB. Upgrade for more
- **Serverless Functions**: Vercel free tier has execution limits
- **File Storage**: Consider CDN for uploaded files
- **LLM Costs**: Monitor OpenAI usage or use Ollama for development
