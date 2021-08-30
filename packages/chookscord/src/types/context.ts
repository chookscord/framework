import type { Config } from './config';
import type { Consola } from 'consola';
import type { FetchUtil } from '@chookscord/lib';

declare module '@chookscord/lib' {
  export interface BaseContext {
    fetch: FetchUtil;
    logger: Consola;
  }
  export interface EventContext {
    config: Config;
  }
}
