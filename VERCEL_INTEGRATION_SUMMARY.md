# Vercel + Supabase Integration - Changes Summary

This document summarizes all changes made to enable deployment on Vercel with Supabase.

## Files Added

### 1. `vercel.json`
- Vercel deployment configuration
- Specifies build command with Prisma generation
- Lists required environment variables
- Configures Next.js framework preset

### 2. `lib/supabase.ts`
- Supabase client initialization
- File upload to Supabase Storage functions
- Support for both CV files and camera snapshots
- Automatic public URL generation

### 3. `SUPABASE_STORAGE_SETUP.md`
- Complete guide for setting up Supabase Storage
- Instructions for creating storage buckets
- Security considerations and best practices
- Troubleshooting section

### 4. `.eslintrc.json`
- ESLint configuration for Next.js
- Enables core-web-vitals rules

## Files Modified

### 1. `package.json`
- Added `@supabase/supabase-js` dependency
- Updated build script to include `prisma generate`
- Added `postinstall` script for automatic Prisma generation

### 2. `lib/file-utils.ts`
- Added Supabase Storage support
- Automatic detection of Vercel environment
- Fallback to local storage for development
- Maintains backward compatibility

### 3. `app/api/test/snapshot/route.ts`
- Updated to use Supabase Storage for camera snapshots
- Conditional storage based on environment
- Helper function for local storage fallback

### 4. `.env.example`
- Added `SUPABASE_URL` variable
- Added `SUPABASE_ANON_KEY` variable
- Detailed comments about storage configuration
- Instructions for bucket creation

### 5. `.github/workflows/build-validation.yml`
- Added Prisma generate step before type checking
- Ensures Prisma client is available during CI builds
- Added DATABASE_URL environment variable for Prisma

### 6. `.github/workflows/pr-checks.yml`
- Added Prisma generate step before type checking
- Ensures Prisma client is available during CI checks
- Added DATABASE_URL environment variable for Prisma

### 7. `.gitignore`
- Added `uploads/` directory to ignore local file uploads
- Added `*.db` and `*.db-journal` for SQLite files

### 8. `DEPLOYMENT.md`
- Updated file storage section to reference Supabase Storage
- Added SUPABASE_URL and SUPABASE_ANON_KEY to required variables
- Simplified deployment steps
- Linked to detailed Supabase Storage setup guide

### 9. `README.md`
- Enhanced deployment section with quick steps
- Added complete list of required environment variables
- Improved clarity for Vercel deployment

## Key Features

### Automatic Storage Detection
The application automatically detects the environment and uses:
- **Supabase Storage** when running on Vercel or when Supabase credentials are configured
- **Local filesystem** for development when Supabase is not configured

### Dual Storage Support
```typescript
// In lib/file-utils.ts and app/api/test/snapshot/route.ts
const USE_SUPABASE = process.env.VERCEL || (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
```

This ensures seamless operation in both development and production.

### Build Process
The build process now includes:
1. `prisma generate` - Generates Prisma client
2. `next build` - Builds Next.js application

This is configured in:
- `package.json` build script
- `vercel.json` buildCommand
- GitHub Actions workflows

## Environment Variables

### Required for Production (Vercel)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generated secret for authentication
- `NEXTAUTH_URL` - Your Vercel app URL
- `LLM_PROVIDER` - Set to "openai"
- `OPENAI_API_KEY` - Your OpenAI API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Required for Local Development
- `DATABASE_URL` - Can use SQLite: `file:./dev.db`
- `NEXTAUTH_SECRET` - Any secret string
- `NEXTAUTH_URL` - `http://localhost:3000`
- `LLM_PROVIDER` - "openai" or "ollama"
- `OPENAI_API_KEY` or Ollama configuration

Supabase variables are optional for local development.

## Deployment Workflow

### For Users

1. **Prepare Supabase**
   ```bash
   # After creating Supabase project
   npx prisma db push
   # Follow SUPABASE_STORAGE_SETUP.md
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository
   - Add environment variables
   - Deploy

3. **Verify**
   - Test application form
   - Upload a CV
   - Check Supabase Storage for uploaded files

### For CI/CD

GitHub Actions workflows now:
- Install dependencies with `npm ci`
- Generate Prisma client automatically
- Run type checks with TypeScript
- Run linter
- Build the application
- Upload build artifacts

## Storage Buckets Required

In Supabase Storage, create two public buckets:

1. **uploads** - For CV/resume files
   - Path structure: `{userId}/{timestamp}.{ext}`
   
2. **snapshots** - For camera snapshots during tests
   - Path structure: `{sessionId}/{timestamp}.jpg`

Both buckets should be set to **public** for direct URL access.

## Testing

The changes have been tested with:
- ✅ Local build succeeds with `npm run build`
- ✅ Prisma client generates correctly
- ✅ TypeScript compiles without errors
- ✅ Build includes all necessary files
- ✅ GitHub Actions workflow syntax is valid

## Next Steps for Users

1. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide
2. Follow [SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md) to set up storage
3. Configure environment variables on Vercel
4. Deploy and test the application

## Backward Compatibility

All changes maintain backward compatibility:
- Local development continues to work with local file storage
- SQLite can still be used for local database
- No breaking changes to existing functionality
- Graceful fallback if Supabase is not configured

## Security Considerations

- File uploads are sanitized using `sanitize-filename`
- Supabase Storage buckets are currently set to public
- For production, consider implementing signed URLs for private access
- Environment variables contain sensitive credentials - never commit them
- Storage buckets can be made private with RLS policies (see SUPABASE_STORAGE_SETUP.md)
