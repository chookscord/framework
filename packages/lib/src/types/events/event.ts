import type { Awaited, ClientEvents } from 'discord.js';
import type { BaseContext } from '../base';

export interface EventContext extends BaseContext {
}

export interface Event<T extends keyof ClientEvents = keyof ClientEvents> {
  name: T;
  once?: boolean;
  execute: (
    ctx: EventContext,
    ...args: ClientEvents[T]
  ) => Awaited<unknown>;
}
