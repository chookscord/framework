import { getCompiler, importTs } from '../../compilers';
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

export async function init(): Promise<void> {
  const { lang, compiler } = await createWatchCompiler();
  const config = await loadConfig(lang, compiler);

  if (!config) {
    return;
  }

  const client = createClient(config);
  const eventCtx = createEventContext(client.self, config);
  const managers = createManagers(compiler, eventCtx);

  // Need to login first before registering slash commands
  await managers.loadEvents();
  await client.login();
  await managers.loadCommands();
}
