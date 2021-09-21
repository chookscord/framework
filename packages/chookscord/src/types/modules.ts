import type { Awaited, Client } from 'discord.js';
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

export interface ModuleLoader {
  init?: () => Awaited<void>;
  update?: (filePath: string) => Awaited<void>;
  remove?: (filePath: string) => Awaited<void>;
}
