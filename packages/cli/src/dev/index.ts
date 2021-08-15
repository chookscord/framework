import { getCompiler, importTs } from '@chookscord/compiler';
import { createClient } from '@chookscord/lib';
import { createEventContext } from './utils';
import { createManagers } from './managers';
import { loadConfig } from './load-config';

async function createWatchCompiler() {
  const compiler = await getCompiler();

  if (compiler.lang === 'js') {
    return {
      lang: compiler.lang,
      compiler: compiler.createCompiler(),
    };
  }

  const ts = await importTs();
  return {
    lang: compiler.lang,
    compiler: compiler.createCompiler({
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2021,
      outDir: '.chooks',
      allowJs: true,
      esModuleInterop: true,
    }),
  };
}

export async function run(): Promise<void> {
  const { lang, compiler } = await createWatchCompiler();
  const config = await loadConfig(lang, compiler);

  if (!config) {
    return;
  }

  const client = createClient(config);
  const eventCtx = createEventContext(client.self, config);
  const managers = createManagers(compiler, eventCtx);

  // Wait for files to be loaded first before logging in
  await Promise.all([
    managers.loadEvents(),
    managers.loadCommands(),
  ]);

  await client.login();
}
