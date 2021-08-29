import * as path from 'path';
import type { Consola } from 'consola';

export async function logVersion(logger: Consola): Promise<void> {
  const packagePath = path.join(__dirname, '..', '..', 'package.json');
  const { name, version } = await import(packagePath);
  logger.info(`Using ${name} v${version}`);
}
