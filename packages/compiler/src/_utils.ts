import { dirname } from 'path';
import fs from 'fs/promises';

export async function mkdir(filePath: string): Promise<void> {
  await fs.mkdir(
    dirname(filePath),
    { recursive: true },
  );
}
