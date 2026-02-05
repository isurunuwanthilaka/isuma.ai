# Quick Start: Deploy to Vercel with Supabase

This is a streamlined guide to get your application running on Vercel with Supabase in under 15 minutes.

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)
- OpenAI API key

## Step 1: Set Up Supabase (5 minutes)

### Create Database
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database to provision (~2 minutes)
3. Go to **Settings** → **Database** → **Connection String**
4. Copy the **URI** format connection string
5. Replace `[YOUR-PASSWORD]` with your database password

### Create Storage Buckets
1. Go to **Storage** in the left sidebar
2. Click **New bucket**
   - Name: `uploads`
   - Public: ✅ Yes
   - Click **Create**
3. Click **New bucket** again
   - Name: `snapshots`
   - Public: ✅ Yes
   - Click **Create**

### Get API Keys
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the long string under "Project API keys")

## Step 2: Push Database Schema (2 minutes)

On your local machine:

```bash
# Clone the repository (if you haven't)
git clone https://github.com/isurunuwanthilaka/isuma.ai.git
cd isuma.ai

# Install dependencies
npm install

# Create .env file with your Supabase connection string
echo 'DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"' > .env

# Push schema to Supabase
npx prisma db push
```

You should see: `✔ Generated Prisma Client`

## Step 3: Deploy to Vercel (3 minutes)

### Option A: Using Vercel Dashboard (Recommended)

1. Push your code to GitHub (if not already)
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click **Add New** → **Project**
4. **Import** your GitHub repository
5. Keep defaults (Vercel detects Next.js automatically)
6. Click **Deploy**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Step 4: Configure Environment Variables (3 minutes)

In Vercel dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add each of these variables:

```
DATABASE_URL
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

NEXTAUTH_SECRET
<run: openssl rand -base64 32>

NEXTAUTH_URL
https://your-app-name.vercel.app

LLM_PROVIDER
openai

OPENAI_API_KEY
sk-...your-openai-key...

SUPABASE_URL
https://[PROJECT-REF].supabase.co

SUPABASE_ANON_KEY
<your-supabase-anon-key>
```

3. Click **Save** after each variable

## Step 5: Redeploy (1 minute)

1. Go to **Deployments** tab
2. Click **...** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~1 minute)

## Step 6: Test Your Application (2 minutes)

1. Click **Visit** to open your deployed app
2. Test the application:
   - Navigate to the application form
   - Fill in details
   - Upload a test CV/resume
   - Submit

3. Verify in Supabase:
   - Go to **Storage** → `uploads` bucket
   - You should see your uploaded file
   - Go to **Database** → **Table Editor** → `Application` table
   - You should see your application record

## 🎉 You're Done!

Your application is now live on Vercel with Supabase!

## Quick Reference

### Your App URLs
- **Production**: `https://your-app.vercel.app`
- **Supabase Dashboard**: `https://supabase.com/dashboard`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

### Common Commands

```bash
# Local development
npm run dev

# Build locally
npm run build

# Push database changes
npx prisma db push

# Deploy
vercel --prod
```

## Troubleshooting

### Build fails on Vercel
- Check that all environment variables are set correctly
- Ensure `DATABASE_URL` is the PostgreSQL connection string, not SQLite

### File upload fails
- Verify `uploads` and `snapshots` buckets exist in Supabase
- Check that buckets are set to **public**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct

### Database connection error
- Check your database password in `DATABASE_URL`
- Verify the connection string format is correct
- Ensure Supabase database is running (check dashboard)

### OpenAI API errors
- Verify `OPENAI_API_KEY` is valid
- Check your OpenAI account has credits
- Ensure `LLM_PROVIDER` is set to `openai`

## Next Steps

- [ ] Set up custom domain in Vercel
- [ ] Configure authentication providers
- [ ] Add admin user via database
- [ ] Review security settings in Supabase
- [ ] Set up monitoring and error tracking
- [ ] Consider making storage buckets private (see SUPABASE_STORAGE_SETUP.md)

## Need More Help?

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🗄️ [Supabase Storage Setup](./SUPABASE_STORAGE_SETUP.md)
- 📋 [Complete Changes Summary](./VERCEL_INTEGRATION_SUMMARY.md)
- 💬 [Open an issue on GitHub](https://github.com/isurunuwanthilaka/isuma.ai/issues)
