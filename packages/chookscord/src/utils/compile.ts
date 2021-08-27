import * as fs from 'fs/promises';
import * as swc from '@swc/core';
import { dirname } from 'path';

async function writeFile(outPath: string, data: string): Promise<void> {
  const outDir = dirname(outPath);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outPath, data);
}

export async function compile(
  filePath: string,
  outPath: string,
  options?: swc.Options,
): Promise<void> {
  const output = await swc.transform(filePath, options);
  await writeFile(outPath, output.code);
}
