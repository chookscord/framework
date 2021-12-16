export * from './register';
export * from './validation';
export * from './compile';
export * from './config';
export * from './diff';
export * from './errors';
export * from './files';
export * from './transform';
export * from './unload';

const resolveLocal = <T>(id: string): T => {
  try {
    return require(id);
  } catch {
    return require(require.resolve(id, { paths: [process.cwd()] }));
  }
};

export const chooksie = resolveLocal<typeof import('chooksie/lib')>('chooksie/lib');
export const types = resolveLocal<typeof import('chooksie/types')>('chooksie/types');
