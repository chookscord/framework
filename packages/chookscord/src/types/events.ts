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

export interface Event<
  T extends keyof ClientEvents = keyof ClientEvents,
  Deps extends Record<string, unknown> = Record<string, never>,
> {
  name: T;
  once?: boolean;
  dependencies?: (this: undefined) => Deps | Promise<Deps>;
  execute: (
    this: Deps,
    ctx: EventContext,
    ...args: ClientEvents[T]
  ) => unknown;
}
