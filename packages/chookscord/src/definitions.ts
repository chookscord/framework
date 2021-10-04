import type * as types from '@chookscord/types';
import type { Config, Event, EventContext } from './types';
import type { ClientEvents } from 'discord.js';

export function defineConfig(
  config: Config,
): Config {
  return config;
}

export function defineEvent<T extends keyof ClientEvents, Deps extends Record<string, unknown>>(
  event: Omit<Event<T, Deps>, 'execute'> &
  { execute: (ctx: EventContext, ...args: ClientEvents[T]) => unknown } &
  ThisType<Readonly<Deps>>,
): Event<T, Deps> {
  return event;
}

export function defineSlashCommand<T extends Record<string, unknown>>(
  command: Omit<types.ChooksSlashCommand<T>, 'execute'> &
  { execute: (ctx: types.ChooksCommandContext) => unknown } &
  ThisType<Readonly<T>>,
): types.ChooksSlashCommand<T> {
  return command;
}

export function defineSlashSubCommand(
  command: types.ChooksSubCommand,
): types.ChooksSubCommand {
  return command;
}

export function defineContextCommand(
  command: types.ChooksContextCommand,
): types.ChooksContextCommand {
  return command;
}

export function defineNonCommandOption(
  option: types.ChooksNonCommandOption,
): types.ChooksNonCommandOption {
  return option;
}

export function defineSubCommandGroup(
  group: types.ChooksGroupCommandOption,
): types.ChooksGroupCommandOption {
  return group;
}

export function defineSubCommand<T extends Record<string, unknown>>(
  subCommand: Omit<types.ChooksSubCommandOption<T>, 'execute'> &
  { execute: (ctx: types.ChooksCommandContext) => unknown } &
  ThisType<Readonly<T>>,
): types.ChooksSubCommandOption<T> {
  return subCommand;
}
