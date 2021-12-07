import type { Awaitable, ClientEvents } from 'discord.js';
import type { ChooksDep, ChooksEventContext } from './base';

export interface ChooksEvent<
  T extends keyof ClientEvents = keyof ClientEvents,
  Deps extends ChooksDep = Record<string, never>,
> {
  name: T;
  once?: boolean;
  setup?: (this: undefined) => Awaitable<Deps>;
  execute: (
    this: Deps,
    ctx: ChooksEventContext,
    ...args: ClientEvents[T]
  ) => unknown;
}
