const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'authorized.db');
const db = new sqlite3.Database(dbPath);

const clientId = '1399579415297654814';
const redirectUri = encodeURIComponent('https://avalauth.vyrotris.com/callback');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guildcount')
        .setDescription('Check how many servers you are in')
        .setIntegrationTypes([1])
        .setContexts([1, 2]),

    async run(interaction) {
        db.get(`SELECT guild_count, last_updated FROM users WHERE id = ?`, [interaction.user.id], async (err, row) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'Database error.', ephemeral: true });
            }

            if (row && Date.now() - row.last_updated < 1000 * 60 * 60 * 24) {
                return interaction.reply({ content: `You are in **${row.guild_count}** servers.`, ephemeral: true });
            }

            const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds&state=${interaction.user.id}`;
            return interaction.reply({
                content: `Please click [here to authorize](${oauthUrl}). Once you do, re-run this command.`,
                ephemeral: true
            });
        });
    }
};