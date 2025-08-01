const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poop')
    .setDescription('Poop!')
    .setIntegrationTypes([1])
    .setContexts([1, 2]),

  async run(interaction) {
    await interaction.reply('Poop!');
  },
};
