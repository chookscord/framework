import { join } from 'path';

export async function importTs(): Promise<typeof import('typescript') | null> {
  try {
    const tsPath = join(process.cwd(), 'node_modules', 'typescript');
    return await import(tsPath);
  } catch {
    return null;
  }
}
