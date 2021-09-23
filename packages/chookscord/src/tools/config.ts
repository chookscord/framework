export enum ConfigFile {
  TS = 'chooks.config.ts',
  JS = 'chooks.config.js',
  TSDev = 'chooks.config.dev.ts',
  JSDev = 'chooks.config.dev.js',
}

export function getConfigFiles(dev?: false): [
  ConfigFile.TS,
  ConfigFile.JS,
];
export function getConfigFiles(dev: true): [
  ConfigFile.TSDev,
  ConfigFile.JSDev,
  ConfigFile.TS,
  ConfigFile.JS,
];
export function getConfigFiles(dev?: boolean): ConfigFile[] {
  return dev
    ? [
        ConfigFile.TSDev,
        ConfigFile.JSDev,
        ConfigFile.TS,
        ConfigFile.JS,
      ]
    : [
        ConfigFile.TS,
        ConfigFile.JS,
      ];
}
