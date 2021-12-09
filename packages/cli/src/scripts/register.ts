/* eslint-disable @typescript-eslint/no-non-null-assertion, object-curly-newline */
process.env.NODE_ENV = 'production';
import { ChooksCommand, DiscordSlashCommand } from 'chooksie/types';
import { ConfigFile, chooksie, registerCommands, resolveConfig, transformCommand } from '../lib';
import { createLogger } from '@chookscord/logger';
import { join } from 'path';

const root = join(process.cwd(), 'dist');
const logger = createLogger('[cli] chooks');

function getConfig() {
  return resolveConfig(
    [ConfigFile.JS],
    chooksie.traverse(root),
  );
}

async function loadCommands() {
  const commandList: DiscordSlashCommand[] = [];
  for await (const file of chooksie.traverse(root, { recursive: true })) {
    if (file.isDir) continue;
    const relativePath = file.path.slice(root.length + 1);
    const moduleName = relativePath.slice(0, relativePath.indexOf('/'));

    if (['commands', 'subcommands', 'contexts'].includes(moduleName)) {
      const mod = chooksie.getDefaultImport(await import(file.path)) as ChooksCommand;
      commandList.push(transformCommand(mod));
    }
  }

  return commandList;
}

export async function run(): Promise<void> {
  logger.info('Registering interactions...');
  const endTimer = chooksie.chrono.createTimer();

  logger.info('Loading config...');
  const config = await getConfig();

  logger.info('Loading commands...');
  const commands = await loadCommands();

  logger.info(`Registering ${commands.length} commands...`);
  const res = await registerCommands(config.credentials, commands);

  if (res.status === 429) {
    const resetAfter = res.headers.get('X-RateLimit-Reset-After');
    const timestamp = Number(resetAfter!);
    logger.error(new Error(`Under rate limit! Retry after: ${chooksie.chrono.formatTime(timestamp, 's')}`));
    return;
  }

  if (!res.ok) {
    logger.error(new Error('Could not register commands!'));
    return;
  }

  logger.success(`Registered ${commands.length} commands! Time took: ${endTimer('s')}`);
}
