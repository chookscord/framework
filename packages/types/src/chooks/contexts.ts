import { ChooksCommandType, ChooksContext } from './base';

export interface ChooksContextCommand<Deps extends Record<string, unknown> = Record<string, never>> {
  type: Exclude<ChooksCommandType, 'CHAT_INPUT'>;
  name: string;
  dependencies?(this: undefined): Deps | Promise<Deps>;
  execute(this: Readonly<Deps>, ctx: ChooksContextCommandContext): unknown;
}

export interface ChooksContextCommandContext extends ChooksContext {
}
