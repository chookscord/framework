const { defineSlashSubCommand, defineSubCommand } = require('chooksie');

const option = {
  name: 'message',
  description: 'The text to transform.',
  type: 'STRING',
  required: true,
};

function setup() {
  const { lowercase } = require('../utils/lowercase');

  function uppercase(text) {
    return text.toUpperCase();
  }

  return {
    lowercase,
    uppercase,
  };
}

module.exports = defineSlashSubCommand({
  name: 'string',
  description: 'Transforms a string of text.',
  options: [
    defineSubCommand({
      name: 'uppercase',
      description: 'Capitalize the text.',
      type: 'SUB_COMMAND',
      setup,
      async execute(ctx) {
        const text = ctx.interaction.options.getString('message', true);
        const message = this.uppercase(text);
        await ctx.interaction.reply(message);
      },
      options: [option],
    }),
    defineSubCommand({
      name: 'lowercase',
      description: 'Lowercase the text.',
      type: 'SUB_COMMAND',
      setup,
      async execute(ctx) {
        const text = ctx.interaction.options.getString('message', true);
        const message = this.lowercase(text);
        await ctx.interaction.reply(message);
      },
      options: [option],
    }),
  ],
});
