import { DefaultExport } from './types';
import { uncachedImport } from '@chookscord/lib';

function pickDefault<T>(data: T | DefaultExport<T>): T {
  return 'default' in data
    ? data.default
    : data;
}

export async function importDefault<T>(path: string): Promise<T> {
  const data: T | DefaultExport<T> = await import(path);
  return pickDefault(data);
}

export async function uncachedImportDefault<T>(path: string): Promise<T> {
  const data = await uncachedImport<T | DefaultExport<T>>(path);
  return pickDefault(data);
}
