import type { UpdateListener } from '../compiler';
import { createLogger } from '@chookscord/lib';

const logger = createLogger('[cli] Events');
export default {
  compile(filePath) {
    logger.info(`TODO: import ${filePath}`);
  },
} as {
  compile?: UpdateListener;
  delete?: UpdateListener;
};
