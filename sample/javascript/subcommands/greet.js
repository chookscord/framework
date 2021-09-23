const { defineSubCommand } = require('chookscord');

module.exports = defineSubCommand({
  name: 'say',
  description: 'Says a greeting.',
  // Execute handlers should be at the subcommand level.
  // There should be AT LEAST ONE subcommand!
  options: [
    {
      name: 'hi',
      description: 'Says hi.',
      type: 'SUB_COMMAND', // Option types are always required!
      async execute({ interaction }) {
        await interaction.reply('Hi!');
      },
    },
    {
      name: 'hello',
      type: 'SUB_COMMAND_GROUP', // Mixing subcommand groups are OK!
      description: 'Says hello.',
      options: [
        {
          name: 'there',
          description: 'Says hello there.',
          type: 'SUB_COMMAND',
          async execute({ interaction }) {
            await interaction.reply('Hello there!');
          },
        },
        {
          name: 'world',
          description: 'Says hello world.',
          type: 'SUB_COMMAND',
          async execute({ interaction }) {
            await interaction.reply('Hello, world!');
          },
        },
      ],
    },
  ],
});
