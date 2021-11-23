/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as lib from '../lib';
import { basename, join } from 'path';
import { getDefaultImport, traverse } from 'chooksie/lib';
import type { ChooksConfig } from 'chooksie';
import { ConfigFile } from '../lib/config';
import { createLogger } from '@chookscord/logger';
import { validateProdConfig } from '../lib/validation/config';

const isModule = process.argv
  .slice(2)
  .includes('--esm');

export const logger = createLogger('[cli] build');

export const enum ExitCode {
  InvalidCommand = 64,
  MissingFile = 72,
  BuildFail = 73,
  Validation = 78,
}

export class ValidationError extends Error {
  constructor(message?: string) {
    super(message);
    super.name = 'ValidationError';
  }
}

const cwd = process.cwd();

const configFiles = [
  ConfigFile.JS,
  ConfigFile.TS,
];

function isProjectFile(fileName: string) {
  return !/^\.|^node_modules$/.test(fileName);
}

function loadProject(rootPath: string) {
  return lib.getProjectFiles({
    rootPath,
    pickConfig: lib.selectConfig.bind(null, configFiles),
    includeFile: file => file.isDir && isProjectFile(basename(file.path)),
  });
}

async function validateConfigFile(
  configPath: string | null,
): Promise<void> {
  lib.checkConfigFile(configPath, logger);
  const outPath = join(process.cwd(), '.chooks', basename(configPath)).replace(/\.ts$/, '.js');
  await lib.compileFile(configPath, outPath);

  const file: ChooksConfig = await import(outPath);
  const config = getDefaultImport(file);

  if (!lib.isConfigValid(config, validateProdConfig, logger)) {
    process.exit();
  }
}

async function compileDirectory(directory: {
  root?: string;
  input: string;
  output: string;
}) {
  const { root = cwd, input, output } = directory;
  const inPath = join(root, input);

  logger.debug(`Compiling directory "${input}".`);
  for await (const file of traverse(inPath, { recursive: true })) {
    logger.trace('File:', file);
    if (file.isDir) continue;

    logger.debug(`Compile file "${file.path}".`);
    const outFile = join(root, output, file.path.slice(inPath.length)).replace(/\.ts$/, '.js');
    lib.compileFile(file.path, outFile);
  }
  logger.debug(`Finished compiling "${input}".`);
}

async function compileDir(dir: string): Promise<void> {
  const dirName = basename(dir);
  await compileDirectory({
    input: dirName,
    output: `.chooks/${dirName}`,
  });
}

const shim = `const __filename = new URL(import.meta.url).pathname;
const __dirname = __filename.slice(0, __filename.lastIndexOf("/"));
`;

export async function run(): Promise<void> {
  logger.info('Loading project...');
  const [configFile, projectFiles] = await loadProject(cwd);
  logger.success('Project loaded.');

  logger.info('Verifying config...');
  await validateConfigFile(configFile);
  logger.success('Config verified.');

  logger.info(`Compiling ${projectFiles.length} directories...`);
  await Promise.all(projectFiles.map(compileDir));
  logger.success(`Compiled ${projectFiles.length} directories.`);

  lib.compileFile(
    `${__dirname}/entrypoint.ts`,
    `${cwd}/.chooks/index.js`,
    code => (isModule ? shim : '') + code,
  );

  logger.success('Project compiled.');
}
