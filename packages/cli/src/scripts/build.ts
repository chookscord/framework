/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as lib from '../lib';
import { basename, join } from 'path';
import { getDefaultImport, traverse } from 'chooksie/lib';
import type { ChooksConfig } from 'chooksie';
import { createLogger } from '@chookscord/logger';

export const logger = createLogger('[cli] build');
const outputDir = 'dist';

const cwd = process.cwd();

const configFiles = [
  lib.ConfigFile.JS,
  lib.ConfigFile.TS,
];

function isProjectFile(fileName: string) {
  return !/^\.|^node_modules$|^dist$/.test(fileName);
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
  const outPath = join(cwd, outputDir, basename(configPath)).replace(/\.ts$/, '.js');
  await lib.compileFile(configPath, outPath);

  const file: ChooksConfig = await import(outPath);
  const config = getDefaultImport(file);

  if (!lib.isConfigValid(config, lib.validateProdConfig, logger)) {
    process.exit(lib.ExitCode.Validation);
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
    output: `${outputDir}/${dirName}`,
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
    `${cwd}/${outputDir}/index.js`,
    code => (process.env.MODULE_TYPE === 'module' ? shim : '') + code,
  );

  logger.success('Project compiled.');
}
