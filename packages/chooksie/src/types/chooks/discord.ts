/* eslint-disable camelcase */
export enum DiscordCommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3,
}

export interface DiscordSlashCommand {
  type?: DiscordCommandType;
  name: string;
  description?: string;
  options?: DiscordOption[];
  default_permission?: boolean;
}

export enum DiscordOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
}

export interface DiscordOptionChoice {
  name: string;
  value: string | number;
}

export interface DiscordOption {
  type: DiscordOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: DiscordOptionChoice[];
  options?: DiscordOption[];
}
