import { EventContext } from '@chookscord/lib';

export interface ModuleConfig {
  input: string;
  output: string;
  ctx: EventContext;
}

export type ReloadModule = (ctx: EventContext) => unknown;
