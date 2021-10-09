import type { Awaitable, Client } from 'discord.js';
import type { ChooksCommand } from '@chookscord/types';
import type { Config } from '.';
import type { FetchUtil } from '@chookscord/lib';

export interface ModuleContext {
  client: Client;
  config: Config;
  fetch: FetchUtil;
}

export interface ModuleConfig {
  input: string;
  output: string;
  ctx: ModuleContext;
  register: () => unknown;
}

export type ReloadModule = (ctx: ModuleContext) => unknown;

export interface ModuleHandler {
  init?: () => Awaitable<void>;
  update?: (filePath: string) => Awaitable<void>;
  remove?: (filePath: string) => Awaitable<void>;
}

export type ModuleName = 'commands' | 'subcommands' | 'events' | 'contexts';

export interface CommandModule {
  parent: ChooksCommand;
  target: ChooksCommand;
}
