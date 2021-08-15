import type {
  ApplicationCommandData,
  ApplicationCommandOptionData,
  Awaited,
  ClientEvents,
  Message,
} from 'discord.js';
import type { CommandContext, EventContext, TextCommandContext } from './contexts';
import type { CommandStore } from '../cache';

export type EventName = keyof ClientEvents;
export type EventArgs<T extends EventName = EventName> = ClientEvents[T];

export type EventHandler<T extends EventName = EventName> = (ctx: EventContext, ...args: EventArgs<T>) => Awaited<void>;

export interface Command extends ApplicationCommandData {
  execute: (ctx: CommandContext) => Awaited<unknown>;
  options?: CommandOption[];
}

export interface CommandOption extends ApplicationCommandOptionData {
}

export interface Event<T extends EventName = EventName> {
  name: T;
  once?: boolean;
  execute: EventHandler<T>;
}

export type MessageValidator = (
  ctx: EventContext,
  message: Message
) => Awaited<boolean>;

export type MessageHandler = (
  ctx: EventContext,
  getCommand: CommandStore<TextCommand>['get'],
  message: Message
) => Awaited<[command: TextCommand, args: string[]] | []>;
