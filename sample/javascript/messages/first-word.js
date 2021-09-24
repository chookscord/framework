const { defineMessageCommand } = require('chookscord');

module.exports = defineMessageCommand({
  name: 'First Word', // Uppercase and spaces are allowed.
  type: 'MESSAGE', // Specifying the type is MESSAGE is required as well.
  async execute({ interaction }) {
    // Fetch the message from where this command was ran
    const message = interaction.options.getMessage('message');

    const firstWord = message.content.split(' ')[0];
    await interaction.reply(`The first word was "${firstWord}"!`);
  },
});
