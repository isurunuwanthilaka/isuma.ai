# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage for file uploads (CVs and camera snapshots).

## Prerequisites

- A Supabase account and project
- Database already set up (see DEPLOYMENT.md)

## Step 1: Enable Storage

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Storage is enabled by default in all projects

## Step 2: Create Storage Buckets

You need to create two storage buckets:

### Create "uploads" bucket (for CV files)

1. Click **New bucket**
2. Name: `uploads`
3. Public bucket: **Yes** (check the box)
4. Click **Create bucket**

### Create "snapshots" bucket (for camera snapshots)

1. Click **New bucket**
2. Name: `snapshots`
3. Public bucket: **Yes** (check the box)
4. Click **Create bucket**

## Step 3: Configure Bucket Policies (Optional)

By default, public buckets allow anyone to read files. You can add additional policies if needed:

### Example: Allow authenticated users to upload

1. Go to **Storage** → **Policies**
2. Select the `uploads` bucket
3. Click **New Policy**
4. Create a policy for INSERT operations:
   - Policy name: `Allow authenticated uploads`
   - Policy definition:
     ```sql
     (bucket_id = 'uploads'::text)
     ```
   - Check: `INSERT`
   - Target roles: `authenticated`
5. Click **Review** and then **Save policy**

## Step 4: Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
   - **Project API keys** → `anon/public`: Your anonymous key

## Step 5: Add Environment Variables

Add these to your `.env` file for local development:

```env
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
```

For Vercel deployment, add these in your Vercel project settings:
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try submitting a job application with a CV file
3. Check the Supabase Storage dashboard to see if files are uploaded
4. Verify the file URL is accessible

## Bucket Structure

Files are organized as follows:

### uploads bucket
```
uploads/
├── {userId}/
│   ├── {timestamp}.pdf
│   ├── {timestamp}.docx
│   └── ...
```

### snapshots bucket
```
snapshots/
├── {sessionId}/
│   ├── {timestamp}.jpg
│   ├── {timestamp}.jpg
│   └── ...
```

## Troubleshooting

### Files not uploading

1. Check that buckets exist and are named correctly (`uploads` and `snapshots`)
2. Verify buckets are set to **public**
3. Check environment variables are set correctly
4. Review browser console and server logs for errors

### "Bucket not found" error

Make sure you've created both buckets with the exact names:
- `uploads`
- `snapshots`

### Permission denied errors

1. Ensure buckets are public
2. Check RLS (Row Level Security) policies if enabled
3. Verify your `SUPABASE_ANON_KEY` is correct

### Files not accessible via URL

1. Confirm buckets are set to **public**
2. Check the URL format: `https://[PROJECT-REF].supabase.co/storage/v1/object/public/[bucket]/[file-path]`
3. Try accessing the file directly in a browser

## Storage Limits

Supabase Free Tier:
- **Storage**: 1 GB
- **Bandwidth**: 2 GB per month

For production use with many applications, consider upgrading to a paid plan.

## Security Considerations

### Public vs Private Buckets

Currently, both buckets are set to **public** for simplicity. In production, consider:

1. **uploads bucket**: 
   - Make private
   - Generate signed URLs for authorized users
   - Add RLS policies to control access

2. **snapshots bucket**:
   - Make private (contains photos of candidates)
   - Add strict RLS policies
   - Only allow access to admins/recruiters

### Implementing Private Buckets

To make buckets private:

1. Go to Storage → Select bucket → Settings
2. Uncheck **Public bucket**
3. Update your code to generate signed URLs:

```typescript
// Example: Generate signed URL for private file
const { data, error } = await supabase
  .storage
  .from('uploads')
  .createSignedUrl('path/to/file.pdf', 3600); // 1 hour expiry

if (data) {
  const signedUrl = data.signedUrl;
  // Use this URL to access the file
}
```

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Row Level Security](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage#uploading-files)
