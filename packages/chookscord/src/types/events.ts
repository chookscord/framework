import type { ClientEvents } from 'discord.js';

export interface EventContext {
}

export interface Event<T extends keyof ClientEvents = keyof ClientEvents> {
  name: T;
  once?: boolean;
  execute: (
    ctx: EventContext,
    ...args: ClientEvents[T]
  ) => unknown;
}
