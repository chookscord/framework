import { defineContextCommand } from 'chookscord';

export default defineContextCommand({
  name: 'High Five',
  type: 'USER',
  async execute({ interaction }) {
    // Get the user where this command was ran
    const target = interaction.options.getUser('user');
    const user = interaction.user;

    await interaction.reply({
      content: `<@${user.id}> high fived <@${target.id}>!`,
      allowedMentions: {
        users: [],
      },
    });
  },
});
