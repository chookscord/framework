import type { Client } from 'discord.js';
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
