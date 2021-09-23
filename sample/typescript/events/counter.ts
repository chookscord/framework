import { defineEvent } from 'chookscord';

let count = 0;

// A simple counter that logs how many times we've run commands.
export default defineEvent({
  name: 'interactionCreate',
  execute({ logger }) {
    logger.info(`Received ${++count} interactions so far!`);
  },
});
