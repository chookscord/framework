import * as lib from '@chookscord/lib';
import * as types from '../../../types';
import * as utils from '../../../utils';

const logger = lib.createLogger('[cli] Events');

export async function init(
  config: Omit<types.ModuleConfig, 'output'>,
): Promise<void> {
  const ctx = config.ctx;
  const files = await lib.loadDir(config.input);

  logger.trace('Checking loaded dir.');
  if (!files) {
    logger.error(new Error(`Could not load directory "${config.input}"!`));
    return;
  }

  const validateEvent = (
    path: string,
    event: types.Event,
  ): string | null => {
    if (JSON.stringify(event) === '{}') {
      return `"${path}" has no exported event!`;
    }

    if (!event.name) {
      return `"${path}" has no event name!`;
    }

    if (typeof event.execute !== 'function') {
      return `"${event.name}" has no handler!`;
    }

    return null;
  };

  const loadEvent = async (filePath: string): Promise<void> => {
    const path = filePath.slice(config.input.length);
    logger.info(`Loading event file "${path}"...`);
    const endTimer = utils.createTimer();

    logger.trace('Loading event.');
    const event = await utils.importDefault<types.Event>(filePath);

    logger.trace('Validating event.');
    const validationError = validateEvent(path, event);
    if (validationError) {
      logger.error(new Error(validationError));
      return;
    }

    logger.trace('Binding context to handler.');
    const execute = event.execute.bind(event, {
      client: ctx.client,
      config: ctx.config,
      fetch: lib.fetch,
      logger: lib.createLogger(`[event] ${event.name}`),
    });

    logger.trace('Attaching listener to client.');
    ctx.client.on(
      event.name,
      execute as (...args: unknown[]) => void,
    );

    logger.success(`Loaded event "${event.name}". Time took: ${endTimer().toLocaleString()}ms`);
  };

  logger.trace('Loading files.');
  for await (const file of files) {
    if (file.isDirectory) continue;
    loadEvent(file.path);
  }
}
