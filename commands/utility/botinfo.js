const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getColor } = require('../../misc/colorUtil');

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

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

      const uptimeMillis = Date.now() - interaction.client.startTime;
      const uptimeSeconds = Math.floor(uptimeMillis / 1000);
      const uptimeStr = formatUptime(uptimeSeconds);

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
          { name: 'Uptime', value: uptimeStr, inline: true },
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
