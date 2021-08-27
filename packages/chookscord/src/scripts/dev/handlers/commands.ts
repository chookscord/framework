import type { UpdateListener } from '../compiler';
import { createLogger } from '@chookscord/lib';

const logger = createLogger('[cli] Commands');
export default {
  compile(filePath) {
    logger.info(`TODO: import ${filePath}`);
  },
} as {
  compile?: UpdateListener;
  delete?: UpdateListener;
};
