import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

function sanitizeFilename(filename: string): string {
  const ext = extname(filename);
  const base = filename.replace(ext, '').replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${base}${ext}`;
}

export async function saveFile(file: File, userId: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = join(process.cwd(), 'uploads');
  
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const safeName = sanitizeFilename(file.name);
  const fileName = `${userId}_${timestamp}_${safeName}`;
  const filePath = join(uploadsDir, fileName);

  await writeFile(filePath, buffer);

  return filePath;
}
