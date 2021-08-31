import * as lib from '@chookscord/lib';
import * as types from '../../../../types';
import { createOnCompile } from './_compile';
import { createOnDelete } from './_delete';
import { createWatchCompiler } from '../../compiler';

const logger = lib.createLogger('[cli] Sub Commands');

export function init(config: types.ModuleConfig): types.ReloadModule {
  const paths: Record<string, string> = {};
  const reload: types.ReloadModule = () => {
    logger.info('Refreshing sub commands...');
    logger.success('Refreshed sub commands.');
  };

  createWatchCompiler({
    ...config,
    onCompile: createOnCompile(logger, paths),
    onDelete: createOnDelete(logger, paths),
  });

  return reload;
}
