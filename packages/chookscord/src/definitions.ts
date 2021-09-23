import type { ChooksSlashCommand, ChooksSubCommand } from '@chookscord/types';
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
  command: ChooksSlashCommand,
): ChooksSlashCommand {
  return command;
}

export function defineSubCommand(
  command: ChooksSubCommand,
): ChooksSubCommand {
  return command;
}

// @todo(Choooks22): Define context command
// @todo(Choooks22): Define message command
