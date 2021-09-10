export interface DiscordCommand {
  type?: DiscordCommandType;
  name: string;
  description: string;
  options?: DiscordCommandOption[];
  default_permission?: boolean;
}

export interface DiscordInteraction {
  type: Exclude<DiscordCommandType, DiscordCommandType.CHAT_INPUT>;
  name: string;
  options?: DiscordCommandOption[];
  defaultPermission?: boolean;
}

export enum DiscordCommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3,
}

export interface DiscordCommandOption {
  type: DiscordCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: DiscordCommandOptionChoice[];
  options?: DiscordCommandOption[];
}

export enum DiscordCommandOptionType {
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

export interface DiscordCommandOptionChoice {
  name: string;
  value: string | number;
}
