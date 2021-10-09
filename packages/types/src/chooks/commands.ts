import type { ChooksCommand, ChooksCommandOption, ChooksCommandOptionType, ChooksContext } from './base';

export interface ChooksSlashCommand<Deps extends Record<string, unknown> = Record<string, never>> extends ChooksCommand<Deps> {
  type?: 'CHAT_INPUT';
  description: string;
  options?: ChooksNonCommandOption[];
  execute(this: Readonly<Deps>, ctx: ChooksCommandContext): unknown;
}

export interface ChooksSubCommand extends Omit<ChooksCommand<never>, 'execute'> {
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

export interface ChooksSubCommandOption<Deps extends Record<string, unknown> = Record<string, never>> extends Omit<ChooksCommandOption, 'type' | 'choices'> {
  type: 'SUB_COMMAND';
  options?: ChooksNonCommandOption[];
  dependencies?(this: undefined): Deps | Promise<Deps>;
  execute(this: Readonly<Deps>, ctx: ChooksCommandContext): unknown;
}

export interface ChooksGroupCommandOption extends Omit<ChooksCommandOption, 'type' | 'choices'> {
  type: 'SUB_COMMAND_GROUP';
  options: ChooksSubCommandOption[];
}

export interface ChooksCommandContext extends ChooksContext {
}
