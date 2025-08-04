const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('numberfact')
    .setDescription('Get a random trivia fact about a number')
    .addIntegerOption(option =>
      option
        .setName('number')
        .setDescription('The number to get a fact about (leave empty for random)')
        .setRequired(false)
    )
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    const number = interaction.options.getInteger('number');
    const url = number !== null
      ? `http://numbersapi.com/${number}/trivia`
      : 'http://numbersapi.com/random/trivia';

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch fact');
      const fact = await res.text();

      const embed = new EmbedBuilder()
        .setTitle('🔢 Number Fact')
        .setDescription(fact)
        .setColor(getColor('info'))
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching number fact:', error);
      await interaction.reply({ content: 'Sorry, I couldn\'t fetch a fact right now. Please try again later.', ephemeral: true });
    }
  }
};