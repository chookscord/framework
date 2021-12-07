import type { ChooksCommand, ChooksConfig, ChooksContext } from './chooks';
import type { Awaitable } from 'discord.js';

export interface ModuleContext extends ChooksContext {
  config: ChooksConfig;
}

export type ReloadModule = (ctx: ModuleContext) => unknown;

export interface ModuleHandler {
  init?: () => Awaitable<void>;
  update?: (filePath: string) => Awaitable<void>;
  remove?: (filePath: string) => Awaitable<void>;
}

export type ModuleName =
  | 'commands'
  | 'subcommands'
  | 'events'
  | 'contexts';

export interface CommandModule {
  parent: ChooksCommand;
  target: ChooksCommand;
}
