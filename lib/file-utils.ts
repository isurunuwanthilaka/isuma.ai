import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sanitize from 'sanitize-filename';

export async function saveFile(file: File, userId: string): Promise<string> {
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
