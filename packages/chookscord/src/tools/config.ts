export enum ConfigFile {
  TS = 'chooks.config.ts',
  JS = 'chooks.config.js',
  TSDev = 'chooks.config.dev.ts',
  JSDev = 'chooks.config.dev.js',
}

const devConfigFiles = [
  ConfigFile.TSDev,
  ConfigFile.JSDev,
] as const;

const configFiles = [
  ConfigFile.TS,
  ConfigFile.JS,
] as const;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getConfigFiles(dev: boolean) {
  return dev
    ? [...devConfigFiles, ...configFiles] as const
    : configFiles;
}
