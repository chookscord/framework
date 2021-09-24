import type { Awaited, Client } from 'discord.js';
import type { ChooksCommand, ChooksInteractionCommand } from '@chookscord/types';
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
  init?: () => Awaited<void>;
  update?: (filePath: string) => Awaited<void>;
  remove?: (filePath: string) => Awaited<void>;
}

export type ModuleName = 'commands' | 'subcommands' | 'events' | 'messages';

export interface CommandModule {
  data: ChooksCommand | ChooksInteractionCommand;
  execute: Exclude<ChooksCommand['execute'], undefined>;
}
