/* eslint-disable complexity */
process.env.NODE_ENV = 'production';
import * as lib from '@chookscord/lib';
import * as tools from '../../tools';
import * as utils from '../../utils';
import { Config } from '../../types';

const logger = lib.createLogger('[cli] Chooks');
const interactionDirs = ['commands'];

// eslint-disable-next-line consistent-return
const findFiles: typeof tools.findFiles = async config => {
  try {
    return await tools.findFiles(config);
  } catch (error) {
    logger.fatal(error);
    process.exit();
  }
};

// Possibly duplicated in other parts of code
function validateConfig(config: Config): string | null {
  if (JSON.stringify(config) === '{}') {
    return 'Config file does not have a default export!';
  }

  if (!config.credentials) {
    return 'No credentials found in config!';
  }

  if (!config.credentials.token || !config.credentials.applicationId) {
    return 'Missing credentials!';
  }

  return null;
}

// @todo(Choooks22): Extract utils from dev utils
export async function run(): Promise<void> {
  const start = Date.now();
  logger.info('Getting all commands...');

  const [configFile, addedModules] = await findFiles({
    path: utils.appendPath.fromOut(),
    configFiles: ['chooks.config.js'],
    directories: interactionDirs,
  });

  if (!configFile) {
    logger.fatal(new Error('Could not find a config file!'));
    process.exit();
  }

  const configPath = utils.appendPath.fromOut(configFile);
  const config = await utils.importDefault<Config>(configPath);

  const configError = validateConfig(config);
  if (configError) {
    logger.fatal(new Error(configError));
    process.exit();
  }

  // @todo(Choooks22): Implement other command types
  const jobs = addedModules.map(async moduleName => {
    const path = utils.appendPath.fromOut(moduleName);
    const commands: lib.SlashCommand[] = [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const files = (await lib.loadDir(path, { recursive: true }))!;

    for await (const file of files) {
      if (file.isDirectory) continue;
      const command = await utils.importDefault<lib.SlashCommand>(file.path);

      // @todo(Choooks22): Switch validation depending on module
      const validationError = lib.validateBaseCommand(command);
      if (validationError) {
        logger.error(new Error(validationError));
        continue;
      }

      commands.push(command);
    }

    return commands;
  });

  const rawCommands = await Promise.all(jobs);
  const interactions = lib.prepareCommands(rawCommands.flat());

  const register = lib.createInteractionRegister(config.credentials);
  const ok = await register(interactions);

  if (!ok) {
    logger.fatal(new Error('Could not register interactions!'));
    process.exit();
  }

  const end = Date.now() - start;
  logger.success(`Registered ${interactions.length} commands. Time took: ${end.toLocaleString()}ms`);
}
