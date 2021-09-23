/* eslint-disable complexity */
process.env.NODE_ENV = 'production';
import * as lib from '@chookscord/lib';
import * as tools from '../../tools';
import { getCommands } from './get-command';
import { getConfig } from './get-config';
import { registerCommands } from './register-commands';
import { validators } from './validators';

const logger = lib.createLogger('[cli] Chooks');

function findProjectFiles() {
  const dirs = Object.keys(validators);
  return tools.findProjectFiles(
    lib.loadDir('.chooks'),
    tools.findConfigFile([tools.ConfigFile.JS]),
    file => !dirs.includes(file.path),
  );
}

function checkConfigFile(fileName: string | null): asserts fileName {
  if (!fileName) {
    logger.fatal(new Error('Could not find a config file!'));
    process.exit();
  }
}

async function getProject(
  configFile: string,
  projectFiles: string[],
) {
  const getConfigJob = getConfig(configFile, { logger });
  const getCommandsJobs = projectFiles.map(getCommands, { logger });

  const commandsList = await Promise.all(getCommandsJobs);
  const config = await getConfigJob;

  return [config, commandsList.flat()] as const;
}

export async function run(): Promise<void> {
  const start = Date.now();
  logger.info('Getting all commands...');

  const [configFile, projectFiles] = await findProjectFiles();
  checkConfigFile(configFile);

  const project = await getProject(configFile, projectFiles);
  await registerCommands(project, { logger });

  const end = Date.now() - start;
  const commandCount = project[1].length;
  logger.success(`Registered ${commandCount} commands. Time took: ${end.toLocaleString()}ms`);
}
