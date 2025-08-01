const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const tempGuildCounts = new Map();

const dbPath = path.join(__dirname, '..', 'data', 'authorized.db');
const db = new sqlite3.Database(dbPath);

const clientId = process.env.CLIENT_ID;
const redirectUri = encodeURIComponent('https://avalauth.vyrotris.com/callback');

db.run(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  guild_count INTEGER,
  last_updated INTEGER
)`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servercount')
    .setDescription('Check how many servers you are in')
    .setIntegrationTypes([1])
    .setContexts([1, 2]),

  async run(interaction) {
    const userId = interaction.user.id;

    const cached = tempGuildCounts.get(userId);
    if (cached && (Date.now() - cached.timestamp < 5 * 60 * 1000)) {
      tempGuildCounts.delete(userId);
      return interaction.reply({ content: `You are in **${cached.guildCount}** servers.`, ephemeral: true });
    }

    db.get('SELECT guild_count, last_updated FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('DB error:', err);
        return interaction.reply({ content: 'Database error.', ephemeral: true });
      }

      if (row && (Date.now() - row.last_updated < 24 * 60 * 60 * 1000)) {
        tempGuildCounts.set(userId, { guildCount: row.guild_count, timestamp: Date.now() });

        return interaction.reply({ content: `You are in **${row.guild_count}** servers.`, ephemeral: true });
      }

      const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${userId}`;

      return interaction.reply({
        content: `Please click [here to authorize](${oauthUrl}). Once you authorize, run this command again.`,
        ephemeral: true
      });
    });
  }
};
