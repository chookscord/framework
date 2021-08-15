import type { Awaited } from 'discord.js';
import type { CommandContext } from './contexts';

export type AppCommandOptionType = (
  'SUB_COMMAND' |
  'SUB_COMMAND_GROUP' |
  'STRING' |
  'INTEGER' |
  'BOOLEAN' |
  'USER' |
  'CHANNEL' |
  'ROLE' |
  'MENTIONABLE' |
  'NUMBER'
);

export interface BaseCommand {
  name: string;
  description: string;
}

export interface Command extends BaseCommand {
  execute: (ctx: CommandContext) => Awaited<unknown>;
  options?: NonCommandOption[];
}

export interface CommandGroup extends BaseCommand {
  options: SubCommandOption[] | SubCommandGroupOption[];
}

export type SlashCommand = Command | CommandGroup;

export interface BaseCommandOption {
  type: AppCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: AppCommandOptionChoice[];
}

export interface AppCommandOptionChoice {
  name: string;
  value: string | number;
}

export interface NonCommandOption extends BaseCommandOption {
  type: Exclude<AppCommandOptionType, 'SUB_COMMAND' | 'SUB_COMMAND_GROUP'>;
  options?: NonCommandOption[];
}

export interface SubCommandOption extends BaseCommandOption {
  type: 'SUB_COMMAND';
  options?: NonCommandOption[];
  execute: (ctx: CommandContext) => Awaited<unknown>;
}

export interface SubCommandGroupOption extends BaseCommandOption {
  type: 'SUB_COMMAND_GROUP';
  options: SubCommandOption[];
}

export type CommandOption = (
  NonCommandOption |
  SubCommandOption |
  SubCommandGroupOption
);
