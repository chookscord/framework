import * as lib from '@chookscord/lib';
import * as tools from '../../../tools';
import * as types from '../../../types';
import * as utils from '../../../utils';

const logger = lib.createLogger('[cli] Events');

function isEventInvalid(event: types.Event) {
  const validationError = tools.validateEvent(event);
  if (validationError) {
    logger.error(new Error(validationError));
  }
  return Boolean(validationError);
}

function bindExecuteHandler(
  event: types.Event,
  ctx: types.ModuleContext,
): (...args: unknown[]) => void {
  // @todo(Choooks22): Bind dependencies to 'this'
  return event.execute.bind(event, {
    client: ctx.client,
    config: ctx.config,
    fetch: lib.fetch,
    logger: lib.createLogger(`[event] ${event.name}`),
  }) as (...args: unknown[]) => void;
}

export async function loadEvents(
  ctx: types.ModuleContext,
  rootPath: string,
): Promise<void> {
  const loadEvent = async (filePath: string): Promise<void> => {
    const path = filePath.slice(rootPath.length);
    logger.info(`Loading event file "${path}"...`);
    const endTimer = utils.createTimer();

    logger.trace('Loading event.');
    const event = lib.pickDefault(await import(filePath) as types.Event);

    logger.trace('Validating event.');
    if (isEventInvalid(event)) return;

    logger.trace('Binding context to handler.');
    const execute = bindExecuteHandler(event, ctx);

    logger.trace('Attaching listener to client.');
    ctx.client.on(event.name, execute);

    logger.success(`Loaded event "${event.name}". Time took: ${endTimer().toLocaleString()}ms`);
  };

  logger.trace('Loading files.');
  const files = lib.loadDir(rootPath, { recursive: true });
  for await (const file of files) {
    if (file.isDirectory) continue;
    loadEvent(file.path);
  }
}
