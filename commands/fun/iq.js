const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('iq')
    .setDescription('Check someone’s IQ')
    .addUserOption(option =>
      option.setName('target').setDescription('The user to check').setRequired(true)
    )
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const iq = Math.floor(Math.random() * 201) - 50;

    const embed = new EmbedBuilder()
      .setTitle('🧠 IQ Test Results')
      .setDescription(`${target}'s IQ is **${iq}**`)
      .setColor(getColor('primary'))
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};