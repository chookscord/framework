const { defineEvent } = require('chookscord');

let count = 0;

// A simple counter that logs how many times we've run commands.
module.exports = defineEvent({
  name: 'interactionCreate',
  execute({ logger }) {
    logger.info(`Received ${++count} interactions so far!`);
  },
});
