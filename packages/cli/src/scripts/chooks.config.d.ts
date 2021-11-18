import type { ChooksConfig } from 'chooksie/types';

declare module './chooks.config.js' {
  const config: ChooksConfig;
  export default config;
}
