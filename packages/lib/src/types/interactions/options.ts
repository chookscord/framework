import { CommandOptionType } from './types';

export interface ApplicationOption {
  type: CommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  options?: ApplicationOption[];
}

export interface CommandOption {
  type: keyof typeof CommandOptionType;
  name: string;
  description: string;
  required?: boolean;
}

export interface CommandChoice {
  name: string;
  value: string | number;
}

export interface NonCommandOption extends CommandOption {
  type: Exclude<keyof typeof CommandOptionType, 'SUB_COMMAND' | 'SUB_COMMAND_GROUP'>;
  choice?: CommandChoice[];
}

export interface SubCommandOption {
  type: 'SUB_COMMAND';
  options?: NonCommandOption[];
}

export interface SubCommandGroupOption {
  type: 'SUB_COMMAND_GROUP';
  options: SubCommandOption[];
}
