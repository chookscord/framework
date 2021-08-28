import type { Config } from './config';
import type { FetchUtil } from '@chookscord/lib';

declare module '@chookscord/lib' {
  export interface EventContext {
    fetch: FetchUtil;
    config: Config;
  }
}
