import { DefaultExport } from './types';
import { uncachedImport } from '@chookscord/lib';

export async function uncachedImportDefault<T>(path: string): Promise<T> {
  const data = await uncachedImport<T | DefaultExport<T>>(path);
  return 'default' in data
    ? data.default
    : data;
}
