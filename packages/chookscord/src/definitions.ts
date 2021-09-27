import type * as types from '@chookscord/types';
import type { Config, Event } from './types';
import type { ClientEvents } from 'discord.js';

export function defineConfig(
  config: Config,
): Config {
  return config;
}

export function defineEvent<T extends keyof ClientEvents>(
  event: Event<T>,
): Event<T> {
  return event;
}

export function defineCommand(
  command: types.ChooksSlashCommand,
): types.ChooksSlashCommand {
  return command;
}

export function defineSubCommand(
  command: types.ChooksSubCommand,
): types.ChooksSubCommand {
  return command;
}

export function defineContextCommand(
  command: types.ChooksContextCommand,
): types.ChooksContextCommand {
  return command;
}
