import type { Client, ClientEvents } from 'discord.js';
import type { Config } from './config';
import type { Consola } from 'consola';
import type { FetchUtil } from '@chookscord/lib';

export interface EventContext {
  client: Client<true>;
  logger: Consola;
  fetch: FetchUtil;
  config: Config;
}

export interface Event<T extends keyof ClientEvents = keyof ClientEvents> {
  name: T;
  once?: boolean;
  execute: (
    ctx: EventContext,
    ...args: ClientEvents[T]
  ) => unknown;
}
