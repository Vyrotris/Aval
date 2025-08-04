const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nerdrate')
    .setDescription('Check how nerdy someone is')
    .addUserOption(option =>
      option.setName('target').setDescription('The user to check').setRequired(true)
    )
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const nerdiness = Math.floor(Math.random() * 101);

    const bar = (p) => '🟩'.repeat(Math.round(p / 10)) + '⬜'.repeat(10 - Math.round(p / 10));

    const embed = new EmbedBuilder()
      .setTitle('🤓 Nerdiness Meter')
      .setDescription(`${target} is **${nerdiness}%** nerdy!`)
      .addFields({ name: 'Nerd Level', value: bar(nerdiness) })
      .setColor(getColor('primary'))
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};