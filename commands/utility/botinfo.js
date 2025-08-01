const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getColor } = require('../../misc/colorUtil');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Show information about the bot')
    .setIntegrationTypes([1])
    .setContexts([1, 2]),

  async run(interaction) {
    try {
      const filePath = path.join(__dirname, '../..', 'data', 'bot_info.json');
      if (!fs.existsSync(filePath)) {
        return interaction.reply({ content: '❌ bot_info.json not found.', ephemeral: true });
      }

      const rawData = fs.readFileSync(filePath, 'utf-8');
      const info = JSON.parse(rawData);

      const commandsCount = interaction.client.commands?.size ?? 0;

      let developersStr = '';
      if (Array.isArray(info.developers)) {
        developersStr = info.developers.join(', ');
      } else {
        developersStr = info.developers || info.developer || 'Unknown';
      }

      const embed = new EmbedBuilder()
        .setTitle(info.name || 'Bot Info')
        .setColor(getColor('primary'))
        .setDescription(info.description || 'No description provided.')
        .addFields(
          { name: 'Version', value: info.version || 'N/A', inline: true },
          { name: 'Developers', value: developersStr, inline: true },
          { name: 'Commands', value: commandsCount.toString(), inline: true },
          { name: 'GitHub', value: info.github ? `[Link](${info.github})` : 'N/A', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Failed to read bot info.', ephemeral: true });
    }
  }
};
