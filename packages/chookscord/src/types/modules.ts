import { EventContext } from '@chookscord/lib';

export type ModuleContext = Omit<EventContext, 'logger'>;
export interface ModuleConfig {
  input: string;
  output: string;
  ctx: ModuleContext;
  register: () => unknown;
}

export type ReloadModule = (ctx: ModuleContext) => unknown;
