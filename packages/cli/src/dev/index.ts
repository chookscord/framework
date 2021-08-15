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

export async function init(): Promise<void> {
  const { lang, compiler } = await createWatchCompiler();
  const config = await loadConfig(lang, compiler);

  if (!config) {
    return;
  }

  const client = createClient(config);
  const eventCtx = createEventContext(client.self, config);
  const managers = createManagers(compiler, eventCtx);

  // since files are now loaded in the background,
  // there's a change that the ready event might be loaded
  // AFTER the bot has logged in.
  managers.loadEvents();
  managers.loadCommands();

  await client.login();
}
