import { Config, setConfig, uncachedImport } from '@chookscord/lib';
import type { Lang } from '../../types';
import type { WatchCompiler } from '../../compilers';
import { existsSync } from 'fs';
import { join } from 'path';

enum ConfigFile {
  DevTS = 'chooks.config.dev.ts',
  DevJS = 'chooks.config.dev.js',
  TS = 'chooks.config.ts',
  JS = 'chooks.config.js',
}

function *getConfigFiles(lang: Lang): Iterable<string> {
  if (process.env.NODE_ENV === 'development') {
    if (lang === 'ts') {
      yield ConfigFile.DevTS;
    }
    yield ConfigFile.DevJS;
  }

  if (lang === 'ts') {
    yield ConfigFile.TS;
  }
  yield ConfigFile.JS;
}

function findConfigFile(files: Iterable<string>): string | null {
  for (const fileName of files) {
    const configPath = join(process.cwd(), fileName);
    if (existsSync(configPath)) {
      return fileName;
    }
  }
  return null;
}

function loadConfigFile(
  watchCompiler: WatchCompiler,
  configFile: string,
): Promise<Config | null> {
  return new Promise(res => {
    watchCompiler.register(configFile, async outPath => {
      const path = join(process.cwd(), outPath);
      const config = await uncachedImport<{ default: Config }>(path);
      setConfig(config.default);
      res(config.default);
    });
  });
}

export function loadConfig(
  lang: Lang,
  compiler: WatchCompiler,
): Promise<Config | null> {
  const files = getConfigFiles(lang);
  const configFile = findConfigFile(files);

  if (!configFile) {
    return null;
  }

  return loadConfigFile(compiler, configFile);
}
