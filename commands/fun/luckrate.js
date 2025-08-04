const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('luckrate')
    .setDescription('Check how lucky someone is today')
    .addUserOption(option =>
      option.setName('target').setDescription('The user to check').setRequired(true)
    )
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const luck = Math.floor(Math.random() * 101);

    const bar = (p) => '🟩'.repeat(Math.round(p / 10)) + '⬜'.repeat(10 - Math.round(p / 10));

    const embed = new EmbedBuilder()
      .setTitle('🍀 Luck Meter')
      .setDescription(`${target} has **${luck}%** luck today!`)
      .addFields({ name: 'Luck', value: bar(luck) })
      .setColor(getColor('secondary'))
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};