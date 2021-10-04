import type { DiscordCommandOptionType, DiscordCommandType } from '../discord';

export type ChooksCommandType = keyof typeof DiscordCommandType;

export interface ChooksCommand<Deps extends Record<string, unknown> = Record<string, never>> {
  type?: ChooksCommandType;
  name: string;
  description?: string;
  dependencies?(this: undefined): Deps | Promise<Deps>;
  execute?(this: Readonly<Deps>, ctx: ChooksContext): unknown;
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

export interface ChooksContext {
}
