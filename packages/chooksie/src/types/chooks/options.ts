/* eslint-disable @typescript-eslint/method-signature-style */
import type { ChooksCommandContext, ChooksDep, EmptyDep } from './base';
import type { Awaitable } from 'discord.js';
import type { DiscordOptionType } from './discord';

export type ChooksOptionType = keyof typeof DiscordOptionType;

/**
 * An option that can be passed to options.
 */
export interface ChooksChoice {
  name: string;
  value: string | number;
}

/**
 * The base interface for slash command options.
 */
export interface ChooksOption {
  type: ChooksOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ChooksChoice[];
  options?: ChooksOption[];
}

/**
 * A command option that can execute commands.
 */
export interface ChooksSubCommandOption<Deps extends ChooksDep = EmptyDep> extends Omit<ChooksOption, 'type' | 'choices'> {
  type: 'SUB_COMMAND';
  options?: ChooksNonCommandOption[];
  setup?(this: undefined): Deps | Promise<Deps>;
  execute(this: Readonly<Deps>, ctx: ChooksCommandContext): Awaitable<void>;
}

/**
 * A command option that holds multiple related subcommands.
 */
export interface ChooksCommandGroupOption extends Omit<ChooksOption, 'type' | 'choices'> {
  type: 'SUB_COMMAND_GROUP';
  options: ChooksSubCommandOption[];
}

/**
 * An option object that are allowed to have choices.
 */
export interface ChooksOptionWithChoice extends Omit<ChooksOption, 'options'> {
  type: 'STRING' | 'INTEGER' | 'NUMBER';
}

/**
 * An option object that are not allowed to have choices.
 */
export interface ChooksOptionWithoutChoice extends Omit<ChooksOption, 'choices' | 'options'> {
  type: Exclude<ChooksOptionType, 'STRING' | 'INTEGER' | 'NUMBER' | 'SUB_COMMAND' | 'SUB_COMMAND_GROUP'>;
}

/**
 * An alias to options with and without choices.
 */
export type ChooksNonCommandOption =
  | ChooksOptionWithoutChoice
  | ChooksOptionWithChoice;
