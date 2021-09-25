import type { ChooksCommand, ChooksCommandOption, ChooksCommandOptionType, ChooksContext } from './base';

export interface ChooksSlashCommand extends ChooksCommand {
  type?: 'CHAT_INPUT';
  description: string;
  options?: ChooksNonCommandOption[];
  execute(ctx: ChooksCommandContext): unknown;
}

export interface ChooksSubCommand extends Omit<ChooksCommand, 'execute'> {
  type?: 'CHAT_INPUT';
  description: string;
  options: (ChooksSubCommandOption | ChooksGroupCommandOption)[];
}

export interface ChooksCommandOptionWithoutChoice extends Omit<ChooksCommandOption, 'choices' | 'options'> {
  type: Exclude<ChooksCommandOptionType, 'STRING' | 'INTEGER' | 'NUMBER' | 'SUB_COMMAND' | 'SUB_COMMAND_GROUP'>;
}

export interface ChooksCommandOptionWithChoice extends Omit<ChooksCommandOption, 'options'> {
  type: 'STRING' | 'INTEGER' | 'NUMBER';
}

export type ChooksNonCommandOption = ChooksCommandOptionWithChoice | ChooksCommandOptionWithoutChoice;

export interface ChooksSubCommandOption extends Omit<ChooksCommandOption, 'type' | 'choices'> {
  type: 'SUB_COMMAND';
  options?: ChooksNonCommandOption[];
  execute(ctx: ChooksCommandContext): unknown;
}

export interface ChooksGroupCommandOption extends Omit<ChooksCommandOption, 'type' | 'choices'> {
  type: 'SUB_COMMAND_GROUP';
  options: ChooksSubCommandOption[];
}

export interface ChooksCommandContext extends ChooksContext {
}
