import type { CommandInteraction, Message } from 'discord.js';
import type { Utils } from './interfaces';

export interface CommandContext extends Utils {
  interaction: CommandInteraction;
}

export interface TextCommandContext extends Utils {
  message: Message;
  args: string[];
}

export interface EventContext extends Utils {
}
