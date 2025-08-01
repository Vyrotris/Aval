const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
} 

const dbPath = path.join(dbDir, 'authorized.db');
const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('Failed to open DB:', err);
    } else {
        console.log('Database opened successfully.');
        // Create users table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                guild_count INTEGER,
                last_updated INTEGER
            )
        `, err => {
            if (err) console.error('Failed to create users table:', err);
            else console.log('Users table ready.');
        });
    }
});

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
