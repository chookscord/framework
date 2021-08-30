import { ApplicationOption } from './options';
import type { CommandType } from './types';

export interface BaseApplicationCommand {
  name: string;
  type: CommandType;
  options?: ApplicationOption[];
}

export interface ApplicationSlashCommand extends BaseApplicationCommand {
  description: string;
  type: CommandType.CHAT_INPUT;
}

export interface ApplicationUserCommand extends BaseApplicationCommand {
  type: CommandType.USER;
}

export interface ApplicationMessageCommand extends BaseApplicationCommand {
  type: CommandType.MESSAGE;
}
