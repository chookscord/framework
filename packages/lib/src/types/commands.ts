import type { Awaited } from 'discord.js';
import type { TextCommandContext } from './contexts';

export interface TextCommand {
  /** Required for command to be registered to messages instead of interactions */
  text: true;
  name: string;
  description: string;
  aliases?: string[];
  execute: (ctx: TextCommandContext) => Awaited<unknown>;
}
