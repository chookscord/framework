import type { ChooksContext } from '@chookscord/types';
import type { ClientEvents } from 'discord.js';
import type { Config } from './config';

export interface EventContext extends ChooksContext {
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
