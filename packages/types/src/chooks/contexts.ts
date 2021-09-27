import { ChooksCommandType, ChooksContext } from './base';

export interface ChooksContextCommand {
  type: Exclude<ChooksCommandType, 'CHAT_INPUT'>;
  name: string;
  execute(ctx: ChooksContextCommandContext): unknown;
}

export interface ChooksContextCommandContext extends ChooksContext {
}
