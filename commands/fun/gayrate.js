const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getColor } = require('../../misc/colorUtil');

const allowedIDs = process.env.ADMINS ? process.env.ADMINS.split(',').map(id => id.trim()) : [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gayrate')
    .setDescription('Get a random gay rate percentage for a user')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('The user to check the gay rate of')
        .setRequired(true)
    )
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]),

  async run(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const rate = allowedIDs.includes(target.id) ? 0 : Math.floor(Math.random() * 100) + 1;

    const progressBar = (percent) => {
    const totalBlocks = 10;
    const clamped = Math.max(0, Math.min(percent, 100));
    const filledBlocks = Math.round((clamped / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return '🟩'.repeat(filledBlocks) + '⬜'.repeat(emptyBlocks);
    };

    const embed = new EmbedBuilder()
      .setTitle('🌈 Gayness Meter')
      .setDescription(`${target} is **${rate}%** gay!`)
      .addFields(
        { name: 'Rating', value: progressBar(rate), inline: false }
      )
      .setColor(getColor('secondary'))
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};