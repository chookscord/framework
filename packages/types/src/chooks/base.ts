import type { DiscordCommandOptionType, DiscordCommandType } from '../discord';

export type ChooksCommandType = keyof typeof DiscordCommandType;

export interface ChooksCommand {
  type?: ChooksCommandType;
  name: string;
  description?: string;
  execute?(ctx: ChooksCommandContext): unknown;
  options?: ChooksCommandOption[];
  defaultPermission?: boolean;
}

export type ChooksCommandOptionType = keyof typeof DiscordCommandOptionType;

export interface ChooksCommandOption {
  type: ChooksCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ChooksCommandOptionChoice[];
  options?: ChooksCommandOption[];
}

export interface ChooksCommandOptionChoice {
  name: string;
  value: string | number;
}

export interface ChooksCommandContext {
}
