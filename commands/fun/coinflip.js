const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getColor } = require('../../misc/colorUtil');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin and get heads or tails')
    .setIntegrationTypes([1])
    .setContexts([1, 2]),

  async run(interaction) {
    const outcomes = ['Heads', 'Tails'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    const embed = new EmbedBuilder()
      .setTitle('🪙 Coin Flip Result')
      .setDescription(`The coin landed on: **${result}**`)
      .setColor(result === 'Heads' ? getColor('secondary') : getColor('primary'))
      .setTimestamp()
      .setFooter({ text: `Requested by ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed] });
  },
};