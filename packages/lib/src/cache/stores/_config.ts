import { Config } from '../../types';

let _config: Config;

export function getConfig(): Config {
  return _config;
}

export function setConfig(config: Config): void {
  _config = config;
}
