import * as fs from 'fs/promises';
import * as swc from '@swc/core';
import { dirname } from 'path';

// Duplicated from scripts/dev/compiler
const defaultOptions: Readonly<swc.Options> = {
  jsc: {
    loose: true,
    target: 'es2021',
    externalHelpers: true,
    parser: {
      syntax: 'typescript',
      dynamicImport: true,
    },
  },
  module: {
    type: 'commonjs',
  },
};

async function mkdir(path: string): Promise<void> {
  const outDir = dirname(path);
  await fs.mkdir(outDir, { recursive: true });
}

export async function compile(
  filePath: string,
  outPath: string,
  options: swc.Options = defaultOptions,
): Promise<void> {
  const job = swc.transformFile(filePath, options);
  await mkdir(outPath);

  const output = await job;
  await fs.writeFile(outPath, output.code);
}
