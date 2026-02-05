import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabase;
}

export async function uploadToSupabase(
  file: File,
  userId: string,
  bucket: string = 'uploads'
): Promise<string> {
  const supabase = getSupabaseClient();
  
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${timestamp}.${fileExt}`;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  
  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return publicUrlData.publicUrl;
}

export async function uploadImageToSupabase(
  imageData: string,
  sessionId: string,
  bucket: string = 'snapshots'
): Promise<string> {
  const supabase = getSupabaseClient();
  
  // Remove data URL prefix if present
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  const timestamp = Date.now();
  const fileName = `${sessionId}/${timestamp}.jpg`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Failed to upload snapshot: ${error.message}`);
  }
  
  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return publicUrlData.publicUrl;
}
