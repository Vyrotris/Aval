const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const { getUserGuildCount } = require('../../misc/guildCountDB');

const clientId = process.env.CLIENT_ID;
const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servercount')
    .setDescription('Check how many servers you are in')
    .setIntegrationTypes([1])
    .setContexts([1, 2]),

  async run(interaction) {
    const userId = interaction.user.id;

    try {
      const row = await getUserGuildCount(userId);

      if (row && (Date.now() - row.last_updated < 60 * 5000)) {
          return interaction.reply({ content: `You are in **${row.guild_count}** servers.`, ephemeral: false });
      }

      const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${userId}`;

      return interaction.reply({
        content: `Please click [here to authorize](${oauthUrl}). Once you authorize, run this command again.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('DB error:', error);
      return interaction.reply({ content: 'Database error.', ephemeral: true });
    }
  }
};
