/* eslint-disable @typescript-eslint/no-shadow */
import type { WatchCompiler } from './_types';
import fs from 'fs/promises';
import { mkdir } from './_utils';
import { readFileSync } from 'fs';
import type ts from 'typescript';
import { watchFile } from './_watcher';

/**
 * Incremental program watcher
 * @see {@link https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#writing-an-incremental-program-watcher Writing an incremental program watcher}
 */
export function tsCompiler(
  ts: typeof import('typescript'),
  compileOptions: ts.CompilerOptions,
): WatchCompiler {
  console.info('[Compiler]: Using ts compiler.');
  const filePaths: string[] = [];
  const files: ts.MapLike<{ version: number }> = {};

  const services = ts.createLanguageService(
    {
      getScriptFileNames: () => filePaths,
      getScriptVersion: fileName => files[fileName]?.version.toString(),
      getScriptSnapshot: fileName => {
        try {
          const fileContents = readFileSync(fileName, 'utf-8');
          return ts.ScriptSnapshot.fromString(fileContents);
        } catch {
          return null;
        }
      },
      getCurrentDirectory: process.cwd,
      getCompilationSettings: () => compileOptions,
      getDefaultLibFileName: ts.getDefaultLibFilePath,
    },
    ts.createDocumentRegistry(),
  );

  const emitFile = (
    path: string,
    onEmit: (outPath: string) => unknown,
  ) => {
    const output = services.getEmitOutput(path);

    if (!output.emitSkipped) {
      console.debug(`[Compiler]: Emitting ${path}.`);
    } else {
      console.error(`[Compiler]: Could not emit ${path}.`);
    }

    output.outputFiles.forEach(async o => {
      await mkdir(o.name);
      await fs.writeFile(o.name, o.text, 'utf-8');
      onEmit(o.name);
    });
  };

  return {
    register(path, onEmit) {
      if (filePaths.includes(path)) {
        return;
      }

      console.info(`[Compiler]: ${path} registered`);
      filePaths.push(path);
      files[path] = { version: 0 };
      emitFile(path, onEmit);

      watchFile(
        path,
        () => {
          files[path].version++;
          emitFile(path, onEmit);
        },
      );
    },
  };
}
