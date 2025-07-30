const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rizz')
    .setDescription('Send some smooth rizz to someone')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('The person you want to send rizz to')
        .setRequired(true)
    )
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    try {
        await interaction.deferReply();

        const target = interaction.options.getUser('target');

        const res = await fetch('https://rizzapi.vercel.app/random');
        if (!res.ok) {
        return interaction.editReply('Failed to fetch rizz.');
        }
        const data = await res.json();
        let rizz = data.text;

        if (!/^(i'm|i am|i'd|i)/i.test(rizz)) {
            rizz = rizz.charAt(0).toLowerCase() + rizz.slice(1);
        }

        await interaction.editReply(`${target}, ${rizz}`);
    } catch (error) {
      console.error(error);
      await interaction.editReply('Something went wrong fetching the rizz.');
    }
  }
};