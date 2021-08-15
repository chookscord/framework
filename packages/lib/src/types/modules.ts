/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Awaited, ClientEvents, Message } from 'discord.js';
import type { CommandStore } from '../cache';
import type { EventContext } from './contexts';
import { TextCommand } from './commands';

export type EventName = keyof ClientEvents;
export type EventArgs<T extends EventName = EventName> = ClientEvents[T];

export type EventHandler<T extends EventName = EventName> = (
  ctx: EventContext,
  ...args: EventArgs<T>
) => Awaited<void>;

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
