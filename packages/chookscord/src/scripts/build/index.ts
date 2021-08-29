/* eslint-disable @typescript-eslint/no-non-null-assertion, complexity */
import 'dotenv/config';
process.env.NODE_ENV = 'production';
import * as lib from '@chookscord/lib';
import * as tools from '../../tools';
import * as utils from '../../utils';

const logger = lib.createLogger('[cli] Chooks');

// @todo(Choooks22): Move config filenames to enum
// Partly duplicated from scripts/register
async function findFiles(): Promise<[configPath: string, dirs: string[]]> {
  const [configFile, dirs] = await tools.findFiles({
    path: process.cwd(),
    configFiles: ['chooks.config.ts', 'chooks.config.js'],
    directories: ['events', 'commands'],
  });

  if (!configFile) {
    logger.fatal(new Error('Config file does not exist!'));
    process.exit();
  }

  return [configFile, dirs];
}

function getOutPath(inPath: string): string {
  const rootLength = utils.appendPath.fromRoot().length;
  return utils.appendPath.fromOut(inPath.slice(rootLength));
}

export async function run(): Promise<void> {
  await utils.logVersion(logger);
  logger.info('Compiling project...');
  const endTimer = utils.createTimer();

  logger.trace('Finding files.');
  const [configFile, dirs] = await findFiles();

  logger.trace('Running compile job for config.');
  const compileConfig = tools.compile(
    utils.appendPath.fromRoot(configFile),
    utils.appendPath.fromOut(configFile).replace(/\.ts$/, '.js'),
  );

  logger.trace('Running compile jobs for loaded dirs.');
  const jobs = dirs.map(async dir => {
    logger.debug(`Creating compile jobs for "${dir}"...`);
    const compileEnd = utils.createTimer();
    const compileJobs: Promise<void>[] = [];
    const path = utils.appendPath.fromRoot(dir);
    const files = await lib.loadDir(path, { recursive: true });

    for await (const file of files!) {
      logger.debug(`Using file: "${file.path}"`);
      if (file.isDirectory) continue;
      const compileJob = tools.compile(
        file.path,
        getOutPath(file.path).replace(/\.ts$/, '.js'),
      );
      compileJobs.push(compileJob);
    }

    logger.debug(`Finished creating compile jobs for "${dir}". Time took: ${compileEnd().toLocaleString()}ms`);
    return Promise.all(compileJobs);
  });

  logger.debug('Waiting for compile jobs to finish...');
  const compileEnd = utils.createTimer();
  const files = await Promise.all([compileConfig, ...jobs] as Promise<void>[]);
  logger.debug(`Compile jobs finished. Time took: ${compileEnd().toLocaleString()}ms`);

  logger.success(`Finished compiling project. Time took: ${endTimer().toLocaleString()}ms`);
  logger.info(`Total file count: ${files.flat().length}`);
}
