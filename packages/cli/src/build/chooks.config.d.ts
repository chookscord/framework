import type { ChooksConfig } from 'chooksie'

declare module './chooks.config.js' {
  const config: ChooksConfig
  export default config
}
