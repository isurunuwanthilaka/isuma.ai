import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sanitize from 'sanitize-filename';
import { uploadToSupabase } from './supabase';

// Check if we're running on Vercel or have Supabase configured
const USE_SUPABASE = process.env.VERCEL || (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

export async function saveFile(file: File, userId: string): Promise<string> {
  // Use Supabase Storage on Vercel or when explicitly configured
  if (USE_SUPABASE) {
    try {
      return await uploadToSupabase(file, userId);
    } catch (error) {
      console.error('Supabase upload failed, falling back to local storage:', error);
      // Fall back to local storage if Supabase fails
    }
  }
  
  // Local file storage for development
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = join(process.cwd(), 'uploads');
  
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const safeName = sanitize(file.name);
  const fileName = `${userId}_${timestamp}_${safeName}`;
  const filePath = join(uploadsDir, fileName);

  await writeFile(filePath, buffer);

  return filePath;
}
