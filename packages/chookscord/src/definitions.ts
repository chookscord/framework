import type {
  BaseSlashCommand,
  Event,
  SlashSubCommand,
  SlashSubCommandGroup,
} from '@chookscord/lib';
import type { ClientEvents } from 'discord.js';
import type { Config } from './types';

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

export function defineSlashCommand(
  command: BaseSlashCommand,
): BaseSlashCommand {
  return command;
}

export function defineSlashSubCommand(
  command: SlashSubCommand,
): SlashSubCommand {
  return command;
}

export function defineSlashCommandGroup(
  command: SlashSubCommandGroup,
): SlashSubCommandGroup {
  return command;
}
