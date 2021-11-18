/* eslint-disable @typescript-eslint/method-signature-style, object-curly-newline */
import type { ChooksCommandContext, ChooksContext, ChooksContextCommandContext, ChooksDep, EmptyDep } from './base';
import type { ChooksCommandGroupOption, ChooksNonCommandOption, ChooksOption, ChooksSubCommandOption } from './options';
import type { Awaitable } from 'discord.js';
import type { DiscordCommandType } from './discord';

export type ChooksCommandType = keyof typeof DiscordCommandType;

/**
 * The base interface for commands.
 */
export interface ChooksCommand<Deps extends ChooksDep = EmptyDep> {
  type?: ChooksCommandType;
  name: string;
  description?: string;
  setup?(this: undefined): Awaitable<Deps>;
  execute?(this: Readonly<Deps>, ctx: ChooksContext): unknown;
  options?: ChooksOption[];
  defaultPermission?: boolean;
}

/**
 * A basic slash command.
 */
export interface ChooksSlashCommand<Deps extends ChooksDep = EmptyDep> extends ChooksCommand<Deps> {
  type?: 'CHAT_INPUT';
  description: string;
  options?: ChooksNonCommandOption[];
  execute(this: Readonly<Deps>, ctx: ChooksCommandContext): unknown;
}

/**
 * A slash command but for use with subcommands.
 */
export interface ChooksSlashSubCommand extends Omit<ChooksCommand<never>, 'execute' | 'setup'> {
  type?: 'CHAT_INPUT';
  description: string;
  options: (ChooksSubCommandOption | ChooksCommandGroupOption)[];
}

/**
 * A simple context menu command.
 */
export interface ChooksContextCommand<Deps extends ChooksDep = EmptyDep> extends Omit<ChooksCommand<Deps>, 'type' | 'description' | 'options'> {
  type: Exclude<ChooksCommandType, 'CHAT_INPUT'>;
  execute(this: Readonly<Deps>, ctx: ChooksContextCommandContext): unknown;
}
