/* eslint-disable complexity */
process.env.NODE_ENV = 'production';
import { ConfigFile, getProjectFiles } from '../../lib';
import { basename, join } from 'path';
import { createLogger } from '@chookscord/logger';
import { getCommands } from './get-command';
import { loadConfig } from './load-config';
import { registerCommands } from './register-commands';
import { validators } from './validators';

const logger = createLogger('[cli] chooks');

function findProjectFiles() {
  return getProjectFiles({
    rootPath: join(process.cwd(), '.chooks'),
    includeFile: file => file.isDir && basename(file.path) in validators,
    pickConfig: (current, fileName) => fileName === ConfigFile.JS,
  }, logger);
}

async function getProject(
  configFile: string | null,
  projectFiles: string[],
) {
  const getConfigJob = loadConfig(configFile, logger);
  const getCommandsJobs = projectFiles.map(getCommands, { logger });

  const commandsList = await Promise.all(getCommandsJobs);
  const config = await getConfigJob;

  return [config, commandsList.flat()] as const;
}

export async function run(): Promise<void> {
  const start = Date.now();
  logger.info('Getting all commands...');

  const [configFile, projectFiles] = await findProjectFiles();

  const project = await getProject(configFile, projectFiles);
  await registerCommands(project, logger);

  const end = Date.now() - start;
  const commandCount = project[1].length;
  logger.success(`Registered ${commandCount} commands. Time took: ${end.toLocaleString()}ms`);
}
