process.env.NODE_ENV = 'production';
import * as lib from '@chookscord/lib';
import * as tools from '../../tools';
import * as utils from '../../utils';

const logger = lib.createLogger('[cli] Chooks');

const configFiles = [
  'chooks.config.ts',
  'chooks.config.js',
];

function compileFile(filePath: string) {
  const outFile = filePath.replace(/\.ts$/, '.js');
  return tools.compile(
    utils.appendPath.fromRoot(filePath),
    utils.appendPath.fromOut(outFile),
  );
}

export async function run(): Promise<void> {
  logger.info('Compiling project...');
  const endTimer = utils.createTimer();

  logger.info('Looking for project files...');
  const [configFile, project] = await tools.findProjectFiles(
    lib.loadDir('.'),
    (file, current) => {
      if (file.isDirectory || !configFiles.includes(file.path)) return false;
      if (!current) return true;

      return configFiles.indexOf(file.path) < configFiles.indexOf(current);
    },
    file => !file.isDirectory || /^(?:\..*|node_modules)$/.test(file.path),
  );

  if (!configFile) {
    logger.fatal(new Error('No config file found!'));
    process.exit();
  }

  let compiledFiles = 1;

  logger.info(`Selected config file "${configFile}".`);
  const compileConfig = compileFile(configFile);

  logger.info('Compiling project...');
  const compileProject = project.map(async dir => {
    const files = lib.loadDir(dir, { recursive: true });
    const compileJobs: Promise<void>[] = [];

    for await (const file of files) {
      if (file.isDirectory || !/\.[tj]s$/.test(file.path)) continue;
      const job = compileFile(file.path);
      compileJobs.push(job);
      compiledFiles++;
      logger.debug(`Added compile job for "${file.path}".`);
    }

    return Promise.all(compileJobs);
  });

  await Promise.all([
    ...compileProject as unknown[],
    compileConfig,
  ]);

  logger.success(`Finished compiling project. Time took: ${endTimer().toLocaleString()}ms`);
  logger.info(`Total file count: ${compiledFiles}`);
}
